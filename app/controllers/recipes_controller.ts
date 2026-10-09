import Recipe from '#models/recipe'
import RecipeIngredient from '#models/recipe_ingredient'
import RecipeTransformer from '#transformers/recipe_transformer'
import { recipePageValidator, recipeValidator } from '#validators/recipe'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class RecipesController {
  private recipesQuery() {
    return Recipe.query()
      .preload('ingredients', (query) => query.orderBy('position', 'asc'))
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

    await db.transaction(async (trx) => {
      const recipe = await Recipe.create(
        {
          name: payload.name,
          description: payload.description || null,
          preparationTime: payload.preparationTime,
          cookingTime: payload.cookingTime,
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
    })

    session.flash('success', 'La recette a été créée.')
    return response.redirect().toRoute('home')
  }

  async edit({ params, inertia }: HttpContext) {
    const recipe = await Recipe.query()
      .where('id', params.id)
      .preload('ingredients', (query) => query.orderBy('position', 'asc'))
      .firstOrFail()

    return inertia.render('recipes/edit', {
      recipe: RecipeTransformer.transform(recipe),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(recipeValidator)

    await db.transaction(async (trx) => {
      const recipe = await Recipe.findOrFail(params.id, { client: trx })

      recipe.merge({
        name: payload.name,
        description: payload.description || null,
        preparationTime: payload.preparationTime,
        cookingTime: payload.cookingTime,
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
    })

    session.flash('success', 'La recette a été modifiée.')
    return response.redirect().toRoute('home')
  }

  async destroy({ params, response, session }: HttpContext) {
    const recipe = await Recipe.findOrFail(params.id)

    await recipe.delete()

    session.flash('success', 'La recette a été supprimée.')
    return response.redirect().toRoute('home')
  }
}
