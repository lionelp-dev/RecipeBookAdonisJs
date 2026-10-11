import type { GeneratedRecipe, GeneratedRecipeName } from '../schemas/generated_recipe_schema.js'
import {
  createRecipeGenerationMessages,
  createRecipeGenerationModel,
} from '../models/recipe_generation_model.js'
import {
  createRecipeNameGenerationMessages,
  createRecipeNameGenerationModel,
} from '../models/recipe_name_generation_model.js'
import { recipeGenerationConfig } from '#config/recipe_generation'

export type { GeneratedRecipe } from '../schemas/generated_recipe_schema.js'

export default class OpenRouterRecipeGenerator {
  isConfigured() {
    return Boolean(recipeGenerationConfig.apiKey)
  }
  async generateName(
    prompt: string,
    excludedRecipeNames: string[] = []
  ): Promise<GeneratedRecipeName> {
    const model = createRecipeNameGenerationModel()
    return model.invoke(createRecipeNameGenerationMessages(prompt, excludedRecipeNames))
  }

  async generateRecipe(prompt: string, recipeName: string): Promise<GeneratedRecipe> {
    const model = createRecipeGenerationModel()
    return model.invoke(createRecipeGenerationMessages(prompt, recipeName))
  }
}
