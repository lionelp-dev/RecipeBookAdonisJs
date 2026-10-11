import type { ApplicationService } from '@adonisjs/core/types'

import LucidRecipeRepository from '#features/recipes/repositories/generated_recipe_repository'
import DriveRecipeImageRepository from '#features/recipes/repositories/recipe_image_repository'
import LucidRecipeNameReservationRepository from '#features/recipes/repositories/recipe_name_reservation_repository'
import OpenRouterRecipeGenerator from '#features/recipes/services/openrouter_recipe_generator'
import OpenRouterRecipeImageGenerator from '#features/recipes/services/openrouter_recipe_image_generator'
import CreateRecipeUseCase from '#features/recipes/use_cases/create_recipe_use_case'
import DeleteRecipeUseCase from '#features/recipes/use_cases/delete_recipe_use_case'
import DiscoverRecipePoolUseCase from '#features/recipes/use_cases/discover_recipe_pool_use_case'
import GenerateRecipesUseCase from '#features/recipes/use_cases/generate_recipes_use_case'
import GetRecipeUseCase from '#features/recipes/use_cases/get_recipe_use_case'
import ListRecipesUseCase from '#features/recipes/use_cases/list_recipes_use_case'
import SaveDiscoveredRecipeUseCase from '#features/recipes/use_cases/save_discovered_recipe_use_case'
import UpdateRecipeUseCase from '#features/recipes/use_cases/update_recipe_use_case'

export default class RecipesProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton(OpenRouterRecipeGenerator, () => new OpenRouterRecipeGenerator())
    this.app.container.singleton(
      OpenRouterRecipeImageGenerator,
      () => new OpenRouterRecipeImageGenerator()
    )
    this.app.container.singleton(DriveRecipeImageRepository, () => new DriveRecipeImageRepository())
    this.app.container.singleton(LucidRecipeRepository, () => new LucidRecipeRepository())
    this.app.container.singleton(
      LucidRecipeNameReservationRepository,
      () => new LucidRecipeNameReservationRepository()
    )

    this.app.container.singleton(
      GenerateRecipesUseCase,
      async (resolver) =>
        new GenerateRecipesUseCase(
          await resolver.make(OpenRouterRecipeGenerator),
          await resolver.make(OpenRouterRecipeImageGenerator),
          await resolver.make(DriveRecipeImageRepository),
          await resolver.make(LucidRecipeRepository),
          await resolver.make(LucidRecipeNameReservationRepository)
        )
    )
    this.app.container.singleton(
      DiscoverRecipePoolUseCase,
      async (resolver) =>
        new DiscoverRecipePoolUseCase(
          await resolver.make(OpenRouterRecipeGenerator),
          await resolver.make(OpenRouterRecipeImageGenerator),
          await resolver.make(LucidRecipeRepository),
          await resolver.make(LucidRecipeNameReservationRepository)
        )
    )
    this.app.container.singleton(
      SaveDiscoveredRecipeUseCase,
      async (resolver) =>
        new SaveDiscoveredRecipeUseCase(
          await resolver.make(LucidRecipeRepository),
          await resolver.make(DriveRecipeImageRepository)
        )
    )
    this.app.container.singleton(
      ListRecipesUseCase,
      async (resolver) => new ListRecipesUseCase(await resolver.make(LucidRecipeRepository))
    )
    this.app.container.singleton(
      GetRecipeUseCase,
      async (resolver) => new GetRecipeUseCase(await resolver.make(LucidRecipeRepository))
    )
    this.app.container.singleton(
      CreateRecipeUseCase,
      async (resolver) =>
        new CreateRecipeUseCase(
          await resolver.make(LucidRecipeRepository),
          await resolver.make(DriveRecipeImageRepository)
        )
    )
    this.app.container.singleton(
      UpdateRecipeUseCase,
      async (resolver) =>
        new UpdateRecipeUseCase(
          await resolver.make(LucidRecipeRepository),
          await resolver.make(DriveRecipeImageRepository)
        )
    )
    this.app.container.singleton(
      DeleteRecipeUseCase,
      async (resolver) =>
        new DeleteRecipeUseCase(
          await resolver.make(LucidRecipeRepository),
          await resolver.make(DriveRecipeImageRepository)
        )
    )
  }
}
