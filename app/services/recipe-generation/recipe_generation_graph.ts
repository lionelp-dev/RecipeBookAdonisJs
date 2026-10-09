import { END, START, StateGraph, StateSchema } from '@langchain/langgraph'
import z from 'zod'

import type { ImageGenerationStatus } from '#models/recipe'
import {
  generatedRecipeSchema,
  type GeneratedRecipeName,
  type GeneratedRecipe,
} from '#services/recipe-generation/generated_recipe'

const MAX_RECIPE_GENERATION_ATTEMPTS = 3

const RecipeGenerationState = new StateSchema({
  prompt: z.string(),
  generateImages: z.boolean(),
  generatedRecipeName: z.string().nullable().default(null),
  generatedRecipe: generatedRecipeSchema.nullable().default(null),
  excludedRecipeNames: z.array(z.string()).default([]),
  generationAttempts: z.number().int().default(0),
  isDuplicateRecipe: z.boolean().default(false),
  hasReservedRecipeName: z.boolean().default(false),
  persistedRecipeId: z.number().int().nullable().default(null),
  imageDataUrl: z.string().nullable().default(null),
  imageKey: z.string().nullable().default(null),
  imageGenerationFailed: z.boolean().default(false),
  shouldCleanupImage: z.boolean().default(false),
})

type RecipeGenerationWorkflowActions = {
  generateRecipeName: (
    prompt: string,
    excludedRecipeNames: string[]
  ) => Promise<GeneratedRecipeName>
  generateRecipe: (prompt: string, recipeName: string) => Promise<GeneratedRecipe>
  recipeNameExists: (recipeName: string) => Promise<boolean>
  reserveRecipeName: (recipeName: string) => Promise<boolean>
  releaseRecipeName: (recipeName: string) => Promise<void>
  persistRecipe: (
    generatedRecipe: GeneratedRecipe,
    imageGenerationStatus: ImageGenerationStatus
  ) => Promise<{ id: number }>
  generateImage: (recipeName: string) => Promise<string | null>
  storeImage: (dataUrl: string) => Promise<string>
  attachImage: (recipeId: number, imageKey: string) => Promise<void>
  markImageGenerationFailed: (recipeId: number) => Promise<void>
  deleteImage: (imageKey: string) => Promise<void>
}

export function createRecipeGenerationGraph(actions: RecipeGenerationWorkflowActions) {
  const graph = new StateGraph(RecipeGenerationState)

  // Demande seulement un nom au modèle, en excluant les noms déjà refusés comme doublons.
  const graphWithRecipeNameGeneration = graph.addNode('generate_recipe_name', async (state) => {
    const generatedRecipeName = await actions.generateRecipeName(
      state.prompt,
      state.excludedRecipeNames
    )

    return {
      generatedRecipeName: generatedRecipeName.name,
      generationAttempts: state.generationAttempts + 1,
      isDuplicateRecipe: false,
    }
  })

  // Vérifie que le nom proposé n'existe pas déjà dans le carnet de recettes.
  const graphWithDuplicateCheck = graphWithRecipeNameGeneration.addNode(
    'check_recipe_duplicate',
    async (state) => {
      if (!state.generatedRecipeName)
        throw new Error('Le nom de recette généré est absent du workflow.')

      const isDuplicateRecipe = await actions.recipeNameExists(state.generatedRecipeName)
      return {
        isDuplicateRecipe,
        excludedRecipeNames: isDuplicateRecipe
          ? [...state.excludedRecipeNames, state.generatedRecipeName]
          : state.excludedRecipeNames,
      }
    }
  )

  // A unique database row makes the check-and-reserve operation safe across
  // concurrent workflow requests. A reservation conflict is retried like a
  // historical duplicate, before the full recipe is generated.
  const graphWithRecipeNameReservation = graphWithDuplicateCheck.addNode(
    'reserve_recipe_name',
    async (state) => {
      if (!state.generatedRecipeName)
        throw new Error('Le nom de recette généré est absent du workflow.')

      const hasReservedRecipeName = await actions.reserveRecipeName(state.generatedRecipeName)
      return {
        hasReservedRecipeName,
        excludedRecipeNames: hasReservedRecipeName
          ? state.excludedRecipeNames
          : [...state.excludedRecipeNames, state.generatedRecipeName],
      }
    }
  )

  // Génère la recette complète seulement après validation de l'unicité de son nom.
  const graphWithRecipeGeneration = graphWithRecipeNameReservation.addNode(
    'generate_recipe',
    async (state) => {
      if (!state.generatedRecipeName)
        throw new Error('Le nom de recette généré est absent du workflow.')

      return {
        generatedRecipe: await actions.generateRecipe(state.prompt, state.generatedRecipeName),
      }
    }
  )

  // Crée la recette et ses relations en base avant le traitement, potentiellement long, de l'image.
  const graphWithRecipePersistence = graphWithRecipeGeneration.addNode(
    'persist_recipe',
    async (state) => {
      if (!state.generatedRecipe) throw new Error('La recette générée est absente du workflow.')

      const imageGenerationStatus: ImageGenerationStatus = state.generateImages
        ? 'pending'
        : 'not_requested'
      try {
        const recipe = await actions.persistRecipe(state.generatedRecipe, imageGenerationStatus)
        return { persistedRecipeId: recipe.id }
      } catch (error) {
        if (state.generatedRecipeName) {
          await actions.releaseRecipeName(state.generatedRecipeName).catch(() => undefined)
        }
        throw error
      }
    }
  )

  // The name is only needed while the expensive content generation is in
  // flight. Release it as soon as the recipe transaction has completed.
  const graphWithRecipeNameRelease = graphWithRecipePersistence.addNode(
    'release_recipe_name',
    async (state) => {
      if (state.generatedRecipeName) {
        await actions.releaseRecipeName(state.generatedRecipeName).catch(() => undefined)
      }
      return {}
    }
  )

  // Demande une image pour la recette persistée. Un échec est enregistré sans annuler la recette.
  const graphWithImageGeneration = graphWithRecipeNameRelease.addNode(
    'generate_image',
    async (state) => {
      if (!state.generatedRecipe) return { imageDataUrl: null, imageGenerationFailed: true }

      const imageDataUrl = await actions.generateImage(state.generatedRecipe.name)
      return { imageDataUrl, imageGenerationFailed: imageDataUrl === null }
    }
  )

  // Copie l'image générée dans le stockage Drive et conserve sa clé pour la relier à la recette.
  const graphWithImageStorage = graphWithImageGeneration.addNode('store_image', async (state) => {
    if (!state.imageDataUrl) return { imageKey: null, imageGenerationFailed: true }

    try {
      return {
        imageKey: await actions.storeImage(state.imageDataUrl),
        imageGenerationFailed: false,
      }
    } catch {
      return { imageKey: null, imageGenerationFailed: true }
    }
  })

  // Associe l'image stockée à la recette et marque son statut comme prêt.
  const graphWithImageAttachment = graphWithImageStorage.addNode('attach_image', async (state) => {
    if (!state.persistedRecipeId || !state.imageKey) {
      return { imageGenerationFailed: true, shouldCleanupImage: false }
    }

    try {
      await actions.attachImage(state.persistedRecipeId, state.imageKey)
      return { imageGenerationFailed: false, shouldCleanupImage: false }
    } catch {
      return { imageGenerationFailed: true, shouldCleanupImage: true }
    }
  })

  // Compense un échec d'association en supprimant le fichier qui ne doit pas rester orphelin.
  const graphWithImageCleanup = graphWithImageAttachment.addNode(
    'cleanup_stored_image',
    async (state) => {
      if (state.imageKey) await actions.deleteImage(state.imageKey).catch(() => undefined)
      return {}
    }
  )

  // Termine un échec d'image en mettant à jour la recette, afin que l'UI retire son loader.
  const graphWithFailureStatus = graphWithImageCleanup.addNode(
    'mark_image_generation_failed',
    async (state) => {
      if (state.persistedRecipeId) {
        await actions.markImageGenerationFailed(state.persistedRecipeId).catch(() => undefined)
      }
      return {}
    }
  )

  // Réessaie jusqu'à trois propositions différentes lorsqu'un nom existe déjà.
  // Ne lance la génération d'image que si elle a été demandée.
  // Si l'API image échoue, la recette reste visible et son statut devient "failed".
  // Si le stockage échoue, le même statut "failed" remplace le loader dans l'interface.
  // Si la mise à jour SQL échoue après le stockage, nettoie d'abord le fichier Drive.
  return graphWithFailureStatus
    .addEdge(START, 'generate_recipe_name')
    .addEdge('generate_recipe_name', 'check_recipe_duplicate')
    .addConditionalEdges(
      'check_recipe_duplicate',
      (state) => {
        if (!state.isDuplicateRecipe) return 'reserve_recipe_name'
        return state.generationAttempts < MAX_RECIPE_GENERATION_ATTEMPTS
          ? 'generate_recipe_name'
          : END
      },
      ['generate_recipe_name', 'reserve_recipe_name', END]
    )
    .addConditionalEdges(
      'reserve_recipe_name',
      (state) => {
        if (state.hasReservedRecipeName) return 'generate_recipe'
        return state.generationAttempts < MAX_RECIPE_GENERATION_ATTEMPTS
          ? 'generate_recipe_name'
          : END
      },
      ['generate_recipe_name', 'generate_recipe', END]
    )
    .addEdge('generate_recipe', 'persist_recipe')
    .addEdge('persist_recipe', 'release_recipe_name')
    .addConditionalEdges(
      'release_recipe_name',
      (state) => (state.generateImages ? 'generate_image' : END),
      ['generate_image', END]
    )
    .addConditionalEdges(
      'generate_image',
      (state) => (state.imageGenerationFailed ? 'mark_image_generation_failed' : 'store_image'),
      ['store_image', 'mark_image_generation_failed']
    )
    .addConditionalEdges(
      'store_image',
      (state) => (state.imageGenerationFailed ? 'mark_image_generation_failed' : 'attach_image'),
      ['attach_image', 'mark_image_generation_failed']
    )
    .addConditionalEdges(
      'attach_image',
      (state) => (state.shouldCleanupImage ? 'cleanup_stored_image' : END),
      ['cleanup_stored_image', END]
    )
    .addEdge('cleanup_stored_image', 'mark_image_generation_failed')
    .addEdge('mark_image_generation_failed', END)
    .compile()
}
