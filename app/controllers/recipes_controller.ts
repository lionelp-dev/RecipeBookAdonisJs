import Recipe from '#models/recipe'
import RecipeIngredient from '#models/recipe_ingredient'
import RecipeStep from '#models/recipe_step'
import RecipeImageService from '#services/recipe_image_service'
import RecipeTransformer from '#transformers/recipe_transformer'
import { recipePageValidator, recipeValidator } from '#validators/recipe'
import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class RecipesController {
  private readonly recipeImages = new RecipeImageService()

  private recipesQuery() {
    return Recipe.query()
      .preload('ingredients', (query) => query.orderBy('position', 'asc'))
      .preload('steps', (query) => query.orderBy('position', 'asc'))
      .orderBy('id', 'desc')
  }

  async index({ request, inertia }: HttpContext) {
    const { page: pageNumber = 1 } = await request.validateUsing(recipePageValidator)

    const page = await this.recipesQuery().paginate(pageNumber, 6)

    return inertia.render('home', {
      recipes: RecipeTransformer.transform(page.all()),
      totalItems: page.total,
      currentPage: page.currentPage,
      lastPage: page.lastPage,
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('recipes/new', {})
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(recipeValidator)
    const imageKey = payload.image ? await this.recipeImages.store(payload.image) : null

    try {
      await db.transaction(async (trx) => {
        const recipe = await Recipe.create(
          {
            name: payload.name,
            description: payload.description || null,
            preparationTime: payload.preparationTime,
            cookingTime: payload.cookingTime,
            imageKey,
            imageGenerationStatus: imageKey ? 'ready' : 'not_requested',
          },
          { client: trx }
        )

        await RecipeIngredient.createMany(
          payload.ingredients.map((ingredient, position) => ({
            recipeId: recipe.id,
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit || null,
            position,
          })),
          { client: trx }
        )
        await RecipeStep.createMany(
          payload.steps.map((step, position) => ({
            recipeId: recipe.id,
            instruction: step.instruction,
            position,
          })),
          { client: trx }
        )
      })
    } catch (error) {
      await this.deleteImageQuietly(imageKey)
      throw error
    }

    session.flash('success', 'La recette a été créée.')
    return response.redirect().toRoute('home')
  }

  async edit({ params, inertia }: HttpContext) {
    const recipe = await Recipe.query()
      .where('id', params.id)
      .preload('ingredients', (query) => query.orderBy('position', 'asc'))
      .preload('steps', (query) => query.orderBy('position', 'asc'))
      .firstOrFail()

    return inertia.render('recipes/edit', {
      recipe: RecipeTransformer.transform(recipe),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(recipeValidator)
    const newImageKey = payload.image ? await this.recipeImages.store(payload.image) : null
    let previousImageKey: string | null = null

    try {
      await db.transaction(async (trx) => {
        const recipe = await Recipe.findOrFail(params.id, { client: trx })
        previousImageKey = recipe.imageKey
        const imageKey = newImageKey ?? (payload.removeImage ? null : previousImageKey)
        const imageGenerationStatus = newImageKey
          ? 'ready'
          : payload.removeImage
            ? 'not_requested'
            : recipe.imageGenerationStatus

        recipe.merge({
          name: payload.name,
          description: payload.description || null,
          preparationTime: payload.preparationTime,
          cookingTime: payload.cookingTime,
          imageKey,
          imageGenerationStatus,
        })
        await recipe.save()

        await RecipeIngredient.query({ client: trx }).where('recipe_id', recipe.id).delete()
        await RecipeIngredient.createMany(
          payload.ingredients.map((ingredient, position) => ({
            recipeId: recipe.id,
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit || null,
            position,
          })),
          { client: trx }
        )
        await RecipeStep.query({ client: trx }).where('recipe_id', recipe.id).delete()
        await RecipeStep.createMany(
          payload.steps.map((step, position) => ({
            recipeId: recipe.id,
            instruction: step.instruction,
            position,
          })),
          { client: trx }
        )
      })
    } catch (error) {
      await this.deleteImageQuietly(newImageKey)
      throw error
    }

    if (
      previousImageKey &&
      (newImageKey || payload.removeImage) &&
      previousImageKey !== newImageKey
    ) {
      await this.deleteImageQuietly(previousImageKey)
    }

    session.flash('success', 'La recette a été modifiée.')
    return response.redirect().toRoute('home')
  }

  async destroy({ params, response, session }: HttpContext) {
    const recipe = await Recipe.findOrFail(params.id)
    const imageKey = recipe.imageKey

    await recipe.delete()
    await this.deleteImageQuietly(imageKey)

    session.flash('success', 'La recette a été supprimée.')
    return response.redirect().toRoute('home')
  }

  private async deleteImageQuietly(imageKey: string | null) {
    if (!imageKey) return

    try {
      await this.recipeImages.delete(imageKey)
    } catch (error) {
      logger.error({ err: error, imageKey }, 'Impossible de supprimer une image de recette')
    }
  }
}
