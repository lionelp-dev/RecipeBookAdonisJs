import DiscoverRecipePoolUseCase from '#features/recipes/use_cases/discover_recipe_pool_use_case'
import ListRecipesUseCase from '#features/recipes/use_cases/list_recipes_use_case'
import SaveDiscoveredRecipeUseCase from '#features/recipes/use_cases/save_discovered_recipe_use_case'
import type Recipe from '#models/recipe'
import RecipeTransformer from '#transformers/recipe_transformer'
import {
  recipeDiscoveryPoolValidator,
  saveDiscoveredRecipeValidator,
} from '#validators/recipe_discovery'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

type HomeExtraProps = {
  discoveryPool?: Awaited<ReturnType<DiscoverRecipePoolUseCase['execute']>>
  savedRecipeId?: number
}

@inject()
export default class RecipeDiscoveryController {
  constructor(
    private readonly discoverRecipePool: DiscoverRecipePoolUseCase,
    private readonly saveDiscoveredRecipe: SaveDiscoveredRecipeUseCase,
    private readonly listRecipes: ListRecipesUseCase
  ) {}

  async pool({ request, response, inertia }: HttpContext) {
    const { prompt } = await request.validateUsing(recipeDiscoveryPoolValidator)
    if (!this.discoverRecipePool.isConfigured()) {
      return response.serviceUnavailable({ error: 'La génération IA n’est pas configurée.' })
    }

    return inertia.render(
      'home',
      await this.homeProps({
        discoveryPool: await this.discoverRecipePool.execute(prompt),
      })
    )
  }

  async save({ request, inertia }: HttpContext) {
    const { recipe, imageDataUrl } = await request.validateUsing(saveDiscoveredRecipeValidator)
    const persistedRecipe = await this.saveDiscoveredRecipe.execute(recipe, imageDataUrl)
    return inertia.render('home', await this.homeProps({ savedRecipeId: persistedRecipe.id }))
  }

  private async homeProps(extra: HomeExtraProps) {
    const page = await this.listRecipes.execute(1)

    return {
      recipes: RecipeTransformer.transform(page.all() as Recipe[]),
      totalItems: page.total,
      currentPage: page.currentPage,
      lastPage: page.lastPage,
      ...extra,
    }
  }
}
