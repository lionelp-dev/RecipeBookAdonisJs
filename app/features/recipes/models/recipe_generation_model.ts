import { ChatOpenRouter } from '@langchain/openrouter'

import { generatedRecipeSchema } from '../schemas/generated_recipe_schema.js'
import { recipeGenerationConfig } from '#config/recipe_generation'

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
