import logger from '@adonisjs/core/services/logger'

import type { UpdateRecipeCommand } from '../contracts/recipe_commands.js'
import type {
  RecipeImageRepository,
  RecipeManagementRepository,
} from '../contracts/recipe_contracts.js'

export default class UpdateRecipeUseCase {
  constructor(
    private readonly recipes: RecipeManagementRepository,
    private readonly images: RecipeImageRepository
  ) {}

  async execute(id: number | string, command: UpdateRecipeCommand) {
    const newImageKey = command.image ? await this.images.store(command.image) : null
    let previousImageKey: string | null = null
    try {
      previousImageKey = await this.recipes.updateManual(id, command, newImageKey)
    } catch (error) {
      await this.deleteImageQuietly(newImageKey)
      throw error
    }
    if (
      previousImageKey &&
      (newImageKey || command.removeImage) &&
      previousImageKey !== newImageKey
    ) {
      await this.deleteImageQuietly(previousImageKey)
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
