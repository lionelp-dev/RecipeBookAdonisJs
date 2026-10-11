import type { GraphNode } from '@langchain/langgraph'

import type { RecipeGenerationContext } from '../contexts/recipe_graph_context.js'
import { type RecipeGenerationState } from '../state/recipe_generation_state.js'

export const markImageGenerationFailed: GraphNode<
  typeof RecipeGenerationState,
  RecipeGenerationContext
> = async (state, runtime) => {
  if (state.persistedRecipeId)
    await runtime
      .context!.recipeRepository.markImageGenerationFailed(state.persistedRecipeId)
      .catch(() => undefined)
  return {}
}
