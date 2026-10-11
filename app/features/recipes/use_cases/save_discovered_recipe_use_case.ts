import type { GeneratedRecipe } from '../schemas/generated_recipe_schema.js'
import type { RecipeImageRepository, RecipeRepository } from '../contracts/recipe_contracts.js'

export default class SaveDiscoveredRecipeUseCase {
  constructor(
    private readonly recipes: RecipeRepository,
    private readonly images: RecipeImageRepository
  ) {}

  async execute(recipe: GeneratedRecipe, imageDataUrl: string | null) {
    let imageKey: string | null = null
    try {
      if (imageDataUrl) imageKey = await this.images.storeDataUrl(imageDataUrl)
      return await this.recipes.persist(recipe, imageKey ? 'ready' : 'not_requested', imageKey)
    } catch (error) {
      if (imageKey) await this.images.delete(imageKey).catch(() => undefined)
      throw error
    }
  }
}
