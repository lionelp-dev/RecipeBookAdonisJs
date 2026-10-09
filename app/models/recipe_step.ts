import { RecipeStepSchema } from '#database/schema'
import Recipe from '#models/recipe'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class RecipeStep extends RecipeStepSchema {
  @belongsTo(() => Recipe)
  declare recipe: BelongsTo<typeof Recipe>
}
