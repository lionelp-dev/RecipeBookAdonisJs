import type {
  RecipeGenerator,
  RecipeImageGenerator,
  RecipeImageRepository,
  RecipeNameReservationRepository,
  RecipeRepository,
} from '../contracts/recipe_contracts.js'
import { recipeGenerationGraph } from '../graphs/recipe_generation_graph.js'

export type GenerateRecipesInput = {
  prompt: string
  count: number
  generateImages: boolean
}

export default class GenerateRecipesUseCase {
  constructor(
    private readonly recipeGenerator: RecipeGenerator,
    private readonly imageGenerator: RecipeImageGenerator,
    private readonly imageRepository: RecipeImageRepository,
    private readonly recipeRepository: RecipeRepository,
    private readonly recipeNameReservations: RecipeNameReservationRepository
  ) {}

  isConfigured() {
    return this.recipeGenerator.isConfigured()
  }

  async execute({ prompt, count, generateImages }: GenerateRecipesInput) {
    const results = await recipeGenerationGraph.batch(
      Array.from({ length: count }, () => ({ prompt, generateImages })),
      {
        maxConcurrency: 5,
        context: {
          recipeGenerator: this.recipeGenerator,
          recipeRepository: this.recipeRepository,
          recipeNameReservations: this.recipeNameReservations,
          imageGenerator: this.imageGenerator,
          imageRepository: this.imageRepository,
        },
      },
      { returnExceptions: true }
    )
    const persistedRecipeCount = results.filter(
      (result) => !(result instanceof Error) && Boolean(result.persistedRecipeId)
    ).length

    return { persistedRecipeCount, failedRecipeCount: count - persistedRecipeCount }
  }
}
