import type Recipe from '#models/recipe'
import RecipeImageRepository from '#features/recipes/repositories/recipe_image_repository'
import { BaseTransformer } from '@adonisjs/core/transformers'

const recipeImages = new RecipeImageRepository()

export default class RecipeTransformer extends BaseTransformer<Recipe> {
  async toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'description',
        'preparationTime',
        'cookingTime',
        'imageGenerationStatus',
      ]),
      imageUrl: this.resource.imageKey ? await recipeImages.url(this.resource.imageKey) : null,
      ingredients: this.resource.ingredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        position: ingredient.position,
      })),
      steps: this.resource.steps.map((step) => ({
        id: step.id,
        instruction: step.instruction,
        position: step.position,
      })),
    }
  }
}
