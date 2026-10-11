import type { RecipeManagementRepository } from '../contracts/recipe_contracts.js'

export default class GetRecipeUseCase {
  constructor(private readonly recipes: RecipeManagementRepository) {}

  execute(id: number | string) {
    return this.recipes.findWithRelations(id)
  }
}
