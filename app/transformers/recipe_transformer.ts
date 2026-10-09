import type Recipe from '#models/recipe'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class RecipeTransformer extends BaseTransformer<Recipe> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'name', 'description', 'preparationTime', 'cookingTime']),
      ingredients: this.resource.ingredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        position: ingredient.position,
      })),
    }
  }
}
