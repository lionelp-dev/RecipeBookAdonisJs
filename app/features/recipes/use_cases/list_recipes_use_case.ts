import type { RecipeManagementRepository } from '../contracts/recipe_contracts.js'

export default class ListRecipesUseCase {
  constructor(private readonly recipes: RecipeManagementRepository) {}

  execute(page: number) {
    return this.recipes.paginate(page, 6)
  }
}
