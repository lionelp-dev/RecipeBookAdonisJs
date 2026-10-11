import logger from '@adonisjs/core/services/logger'

import type { CreateRecipeCommand } from '../contracts/recipe_commands.js'
import type {
  RecipeImageRepository,
  RecipeManagementRepository,
} from '../contracts/recipe_contracts.js'

export default class CreateRecipeUseCase {
  constructor(
    private readonly recipes: RecipeManagementRepository,
    private readonly images: RecipeImageRepository
  ) {}

  async execute(command: CreateRecipeCommand) {
    const imageKey = command.image ? await this.images.store(command.image) : null
    try {
      await this.recipes.createManual(command, imageKey)
    } catch (error) {
      await this.deleteImageQuietly(imageKey)
      throw error
    }
  }

  private async deleteImageQuietly(imageKey: string | null) {
    if (!imageKey) return
    try {
      await this.images.delete(imageKey)
    } catch (error) {
      logger.error({ err: error, imageKey }, 'Impossible de supprimer une image de recette')
    }
  }
}
