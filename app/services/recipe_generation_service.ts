import type {
  GeneratedRecipe,
  GeneratedRecipeName,
} from '#services/recipe-generation/generated_recipe'
import {
  createRecipeGenerationMessages,
  createRecipeGenerationModel,
  createRecipeNameGenerationMessages,
  createRecipeNameGenerationModel,
} from '#services/recipe-generation/recipe_generation_model'

export type { GeneratedRecipe } from '#services/recipe-generation/generated_recipe'

export default class RecipeGenerationService {
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
