import { ChatOpenRouter } from '@langchain/openrouter'
import {
  generatedRecipeNameSchema,
  generatedRecipeSchema,
} from '#services/recipe-generation/generated_recipe'
import { recipeGenerationConfig } from '#services/recipe-generation/recipe_generation_config'

export function createRecipeGenerationModel() {
  return new ChatOpenRouter({
    model: recipeGenerationConfig.textModel,
    apiKey: recipeGenerationConfig.apiKey,
    baseURL: recipeGenerationConfig.baseUrl,
    temperature: recipeGenerationConfig.temperature,
  }).withStructuredOutput(generatedRecipeSchema, {
    method: 'jsonSchema',
    strict: true,
  })
}

export function createRecipeNameGenerationModel() {
  return new ChatOpenRouter({
    model: recipeGenerationConfig.textModel,
    apiKey: recipeGenerationConfig.apiKey,
    baseURL: recipeGenerationConfig.baseUrl,
    temperature: recipeGenerationConfig.temperature,
  }).withStructuredOutput(generatedRecipeNameSchema, {
    method: 'jsonSchema',
    strict: true,
  })
}

export function createRecipeNameGenerationMessages(
  prompt: string,
  excludedRecipeNames: string[] = []
) {
  const excludedNamesInstruction = excludedRecipeNames.length
    ? `\n\nNe génère aucune recette nommée : ${excludedRecipeNames.join(', ')}. Propose une recette différente.`
    : ''

  return [
    {
      role: 'system' as const,
      content:
        'Tu es un chef cuisinier expert. Propose uniquement un nom de recette réaliste, varié et explicite.',
    },
    {
      role: 'user' as const,
      content: `Demande utilisateur : ${prompt}\n\nPropose un nom de recette unique.${excludedNamesInstruction}`,
    },
  ]
}

export function createRecipeGenerationMessages(prompt: string, recipeName: string) {
  return [
    {
      role: 'system' as const,
      content: `Tu es un chef cuisinier expert. Génère des recettes réalistes, variées et directement exploitables.
Chaque recette doit avoir des quantités cohérentes, des durées en minutes, et au moins une étape claire.
Ne génère ni catégories, ni tags, ni portions, ni moments de repas.`,
    },
    {
      role: 'user' as const,
      content: `Demande utilisateur : ${prompt}\n\nGénère la recette complète dont le nom doit être exactement : ${recipeName}.`,
    },
  ]
}
