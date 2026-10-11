import { ChatOpenRouter } from '@langchain/openrouter'

import { generatedRecipeNameSchema } from '../schemas/generated_recipe_schema.js'
import { recipeGenerationConfig } from '#config/recipe_generation'

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
