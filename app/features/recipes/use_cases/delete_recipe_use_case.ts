import logger from '@adonisjs/core/services/logger'

import type {
  RecipeImageRepository,
  RecipeManagementRepository,
} from '../contracts/recipe_contracts.js'

export default class DeleteRecipeUseCase {
  constructor(
    private readonly recipes: RecipeManagementRepository,
    private readonly images: RecipeImageRepository
  ) {}

  async execute(id: number | string) {
    const imageKey = await this.recipes.deleteById(id)
    if (!imageKey) return
    try {
      await this.images.delete(imageKey)
    } catch (error) {
      logger.error({ err: error, imageKey }, 'Impossible de supprimer une image de recette')
    }
  }
}
