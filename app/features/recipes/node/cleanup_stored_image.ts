import type { GraphNode } from '@langchain/langgraph'

import type { RecipeGenerationContext } from '../contexts/recipe_graph_context.js'
import { type RecipeGenerationState } from '../state/recipe_generation_state.js'

export const cleanupStoredImage: GraphNode<
  typeof RecipeGenerationState,
  RecipeGenerationContext
> = async (state, runtime) => {
  if (state.imageKey)
    await runtime.context!.imageRepository.delete(state.imageKey).catch(() => undefined)
  return {}
}
