import Recipe from '#models/recipe'
import RecipeTransformer from '#transformers/recipe_transformer'
import { recipeValidator } from '#validators/recipe'
import type { HttpContext } from '@adonisjs/core/http'

export default class RecipesController {
  async index({ inertia }: HttpContext) {
    const recipes = await Recipe.query().orderBy('id', 'asc')

    return inertia.render('home', {
      recipes: RecipeTransformer.transform(recipes),
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('recipes/new', {})
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(recipeValidator)

    await Recipe.create({
      ...payload,
      description: payload.description,
    })

    session.flash('success', 'La recette a été créée.')
    return response.redirect().toRoute('home')
  }

  async edit({ params, inertia }: HttpContext) {
    const recipe = await Recipe.findOrFail(params.id)

    return inertia.render('recipes/edit', {
      recipe: RecipeTransformer.transform(recipe),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const recipe = await Recipe.findOrFail(params.id)
    const payload = await request.validateUsing(recipeValidator)

    recipe.merge({
      ...payload,
      description: payload.description || null,
    })
    await recipe.save()

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
