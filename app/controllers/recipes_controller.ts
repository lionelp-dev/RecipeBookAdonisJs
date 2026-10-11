import CreateRecipeUseCase from '#features/recipes/use_cases/create_recipe_use_case'
import DeleteRecipeUseCase from '#features/recipes/use_cases/delete_recipe_use_case'
import GetRecipeUseCase from '#features/recipes/use_cases/get_recipe_use_case'
import ListRecipesUseCase from '#features/recipes/use_cases/list_recipes_use_case'
import UpdateRecipeUseCase from '#features/recipes/use_cases/update_recipe_use_case'
import type Recipe from '#models/recipe'
import RecipeTransformer from '#transformers/recipe_transformer'
import { recipePageValidator, recipeValidator } from '#validators/recipe'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class RecipesController {
  constructor(
    private readonly listRecipes: ListRecipesUseCase,
    private readonly getRecipe: GetRecipeUseCase,
    private readonly createRecipe: CreateRecipeUseCase,
    private readonly updateRecipe: UpdateRecipeUseCase,
    private readonly deleteRecipe: DeleteRecipeUseCase
  ) {}

  async index({ request, inertia }: HttpContext) {
    const { page: pageNumber = 1 } = await request.validateUsing(recipePageValidator)

    const page = await this.listRecipes.execute(pageNumber)

    return inertia.render('home', {
      recipes: RecipeTransformer.transform(page.all() as Recipe[]),
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
    await this.createRecipe.execute(payload)

    session.flash('success', 'La recette a été créée.')
    return response.redirect().toRoute('home')
  }

  async edit({ params, inertia }: HttpContext) {
    const recipe = (await this.getRecipe.execute(params.id)) as Recipe

    return inertia.render('recipes/edit', {
      recipe: RecipeTransformer.transform(recipe),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(recipeValidator)
    await this.updateRecipe.execute(params.id, payload)

    session.flash('success', 'La recette a été modifiée.')
    return response.redirect().toRoute('home')
  }

  async destroy({ params, response, session }: HttpContext) {
    await this.deleteRecipe.execute(params.id)

    session.flash('success', 'La recette a été supprimée.')
    return response.redirect().toRoute('home')
  }
}
