import RecipeImageGenerationService from '#services/recipe_image_generation_service'
import RecipeImageService from '#services/recipe_image_service'
import { createRecipeGenerationGraph } from '#services/recipe-generation/recipe_generation_graph'
import RecipeGenerationService from '#services/recipe_generation_service'
import PersistGeneratedRecipeService from '#services/persist_generated_recipe_service'
import AiRecipeNameReservationService from '#services/ai_recipe_name_reservation_service'

type RecipeGenerationWorkflowInput = {
  prompt: string
  count: number
  generateImages: boolean
}

export default class RecipeGenerationWorkflow {
  private readonly recipeGenerationService = new RecipeGenerationService()
  private readonly recipeImageGenerationService = new RecipeImageGenerationService()
  private readonly recipeImageService = new RecipeImageService()
  private readonly persistGeneratedRecipeService = new PersistGeneratedRecipeService()
  private readonly aiRecipeNameReservationService = new AiRecipeNameReservationService()

  async run({ prompt, count, generateImages }: RecipeGenerationWorkflowInput) {
    const graph = createRecipeGenerationGraph({
      generateRecipeName: (recipePrompt, excludedRecipeNames) =>
        this.recipeGenerationService.generateName(recipePrompt, excludedRecipeNames),
      generateRecipe: (recipePrompt, recipeName) =>
        this.recipeGenerationService.generateRecipe(recipePrompt, recipeName),
      recipeNameExists: (recipeName) =>
        this.persistGeneratedRecipeService.recipeNameExists(recipeName),
      reserveRecipeName: (recipeName) => this.aiRecipeNameReservationService.reserve(recipeName),
      releaseRecipeName: (recipeName) => this.aiRecipeNameReservationService.release(recipeName),
      persistRecipe: (generatedRecipe, imageGenerationStatus) =>
        this.persistGeneratedRecipeService.persist(generatedRecipe, imageGenerationStatus),
      generateImage: (recipeName) => this.recipeImageGenerationService.generate(recipeName),
      storeImage: (dataUrl) => this.recipeImageService.storeDataUrl(dataUrl),
      attachImage: (recipeId, imageKey) =>
        this.persistGeneratedRecipeService.attachImage(recipeId, imageKey),
      markImageGenerationFailed: (recipeId) =>
        this.persistGeneratedRecipeService.markImageGenerationFailed(recipeId),
      deleteImage: (imageKey) => this.recipeImageService.delete(imageKey),
    })
    const results = await graph.batch(
      Array.from({ length: count }, () => ({ prompt, generateImages })),
      { maxConcurrency: 5 },
      { returnExceptions: true }
    )
    const persistedRecipeCount = results.filter(
      (result) => !(result instanceof Error) && Boolean(result.persistedRecipeId)
    ).length

    return { persistedRecipeCount, failedRecipeCount: count - persistedRecipeCount }
  }
}
