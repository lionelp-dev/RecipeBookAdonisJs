import type { GraphNode } from '@langchain/langgraph'

import type { RecipeGenerationContext } from '../contexts/recipe_graph_context.js'
import { type RecipeGenerationState } from '../state/recipe_generation_state.js'

export const attachImage: GraphNode<typeof RecipeGenerationState, RecipeGenerationContext> = async (
  state,
  runtime
) => {
  if (!state.persistedRecipeId || !state.imageKey)
    return { imageGenerationFailed: true, shouldCleanupImage: false }
  try {
    await runtime.context!.recipeRepository.attachImage(state.persistedRecipeId, state.imageKey)
    return { imageGenerationFailed: false, shouldCleanupImage: false }
  } catch {
    return { imageGenerationFailed: true, shouldCleanupImage: true }
  }
}
