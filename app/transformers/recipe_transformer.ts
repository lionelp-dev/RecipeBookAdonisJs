import type Recipe from '#models/recipe'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class RecipeTransformer extends BaseTransformer<Recipe> {
  toObject() {
    return this.pick(this.resource, ['id', 'name', 'description', 'preparationTime', 'cookingTime'])
  }
}
