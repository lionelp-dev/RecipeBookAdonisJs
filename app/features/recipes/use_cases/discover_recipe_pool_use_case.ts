import type {
  RecipeGenerator,
  RecipeImageGenerator,
  RecipeNameReservationRepository,
  RecipeRepository,
} from '../contracts/recipe_contracts.js'
import { recipeDiscoveryGraph } from '../graphs/recipe_discovery_graph.js'
import type { GeneratedRecipe } from '../schemas/generated_recipe_schema.js'

const POOL_SIZE = 10
const MAX_CONCURRENCY = 5

export type DiscoveredRecipe = GeneratedRecipe & {
  imageDataUrl: string | null
  imageGenerationFailed: boolean
}

export default class DiscoverRecipePoolUseCase {
  constructor(
    private readonly recipeGenerator: RecipeGenerator,
    private readonly imageGenerator: RecipeImageGenerator,
    private readonly recipeRepository: RecipeRepository,
    private readonly recipeNameReservations: RecipeNameReservationRepository
  ) {}

  isConfigured() {
    return this.recipeGenerator.isConfigured()
  }

  async execute(prompt: string) {
    const results = await recipeDiscoveryGraph.batch(
      Array.from({ length: POOL_SIZE }, () => ({ prompt })),
      {
        maxConcurrency: MAX_CONCURRENCY,
        context: {
          recipeGenerator: this.recipeGenerator,
          recipeRepository: this.recipeRepository,
          recipeNameReservations: this.recipeNameReservations,
          imageGenerator: this.imageGenerator,
        },
      },
      { returnExceptions: true }
    )
    const recipes: DiscoveredRecipe[] = []

    for (const result of results) {
      if (result instanceof Error || !result.generatedRecipe) continue
      recipes.push({
        ...result.generatedRecipe,
        imageDataUrl: result.imageDataUrl,
        imageGenerationFailed: result.imageGenerationFailed,
      })
    }

    return { recipes, failedRecipeCount: POOL_SIZE - recipes.length }
  }
}
