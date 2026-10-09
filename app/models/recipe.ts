import { RecipeSchema } from '#database/schema'
import RecipeIngredient from '#models/recipe_ingredient'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Recipe extends RecipeSchema {
  @hasMany(() => RecipeIngredient, { foreignKey: 'recipeId' })
  declare ingredients: HasMany<typeof RecipeIngredient>
}
