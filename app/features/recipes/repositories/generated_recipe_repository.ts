import Recipe from '#models/recipe'
import RecipeIngredient from '#models/recipe_ingredient'
import RecipeStep from '#models/recipe_step'
import type { ImageGenerationStatus } from '../contracts/image_generation_status.js'
import type { CreateRecipeCommand, UpdateRecipeCommand } from '../contracts/recipe_commands.js'
import type { GeneratedRecipe } from '../schemas/generated_recipe_schema.js'
import db from '@adonisjs/lucid/services/db'

export default class LucidRecipeRepository {
  private queryWithRelations() {
    return Recipe.query()
      .preload('ingredients', (query) => query.orderBy('position', 'asc'))
      .preload('steps', (query) => query.orderBy('position', 'asc'))
      .orderBy('id', 'desc')
  }

  paginate(page: number, perPage: number) {
    return this.queryWithRelations().paginate(page, perPage)
  }

  async findWithRelations(id: number | string) {
    return this.queryWithRelations().where('id', id).firstOrFail()
  }

  async createManual(command: CreateRecipeCommand, imageKey: string | null) {
    await db.transaction(async (trx) => {
      const recipe = await Recipe.create(
        {
          name: command.name,
          description: command.description || null,
          preparationTime: command.preparationTime,
          cookingTime: command.cookingTime,
          imageKey,
          imageGenerationStatus: imageKey ? 'ready' : 'not_requested',
        },
        { client: trx }
      )
      await RecipeIngredient.createMany(
        command.ingredients.map((ingredient, position) => ({
          ...ingredient,
          recipeId: recipe.id,
          position,
        })),
        { client: trx }
      )
      await RecipeStep.createMany(
        command.steps.map((step, position) => ({ ...step, recipeId: recipe.id, position })),
        { client: trx }
      )
    })
  }

  async updateManual(
    id: number | string,
    command: UpdateRecipeCommand,
    newImageKey: string | null
  ) {
    return db.transaction(async (trx) => {
      const recipe = await Recipe.findOrFail(id, { client: trx })
      const previousImageKey = recipe.imageKey
      const imageKey = newImageKey ?? (command.removeImage ? null : previousImageKey)
      const imageGenerationStatus = newImageKey
        ? 'ready'
        : command.removeImage
          ? 'not_requested'
          : recipe.imageGenerationStatus
      recipe.merge({
        name: command.name,
        description: command.description || null,
        preparationTime: command.preparationTime,
        cookingTime: command.cookingTime,
        imageKey,
        imageGenerationStatus,
      })
      await recipe.save()
      await RecipeIngredient.query({ client: trx }).where('recipe_id', recipe.id).delete()
      await RecipeIngredient.createMany(
        command.ingredients.map((ingredient, position) => ({
          ...ingredient,
          recipeId: recipe.id,
          position,
        })),
        { client: trx }
      )
      await RecipeStep.query({ client: trx }).where('recipe_id', recipe.id).delete()
      await RecipeStep.createMany(
        command.steps.map((step, position) => ({ ...step, recipeId: recipe.id, position })),
        { client: trx }
      )
      return previousImageKey
    })
  }

  async deleteById(id: number | string) {
    const recipe = await Recipe.findOrFail(id)
    const imageKey = recipe.imageKey
    await recipe.delete()
    return imageKey
  }
  async persist(
    generatedRecipe: GeneratedRecipe,
    imageGenerationStatus: ImageGenerationStatus,
    imageKey: string | null = null
  ): Promise<Recipe> {
    return db.transaction(async (trx) => {
      const recipe = await Recipe.create(
        {
          name: generatedRecipe.name,
          description: generatedRecipe.description,
          preparationTime: generatedRecipe.preparationTime,
          cookingTime: generatedRecipe.cookingTime,
          imageKey,
          imageGenerationStatus,
        },
        { client: trx }
      )
      await RecipeIngredient.createMany(
        generatedRecipe.ingredients.map((ingredient, position) => ({
          ...ingredient,
          recipeId: recipe.id,
          position,
        })),
        { client: trx }
      )
      await RecipeStep.createMany(
        generatedRecipe.steps.map((step, position) => ({
          ...step,
          recipeId: recipe.id,
          position,
        })),
        { client: trx }
      )

      return recipe
    })
  }

  async attachImage(recipeId: number, imageKey: string) {
    const recipe = await Recipe.findOrFail(recipeId)
    recipe.imageKey = imageKey
    recipe.imageGenerationStatus = 'ready'
    await recipe.save()
  }

  async markImageGenerationFailed(recipeId: number) {
    const recipe = await Recipe.findOrFail(recipeId)
    recipe.imageGenerationStatus = 'failed'
    await recipe.save()
  }

  async recipeNameExists(recipeName: string) {
    const recipe = await Recipe.query()
      .whereRaw('LOWER(name) = LOWER(?)', [recipeName.trim()])
      .first()

    return Boolean(recipe)
  }
}
