import type { GraphNode } from '@langchain/langgraph'

import type { RecipeGenerationContext } from '../contexts/recipe_graph_context.js'
import { type RecipeGenerationState } from '../state/recipe_generation_state.js'

export const storeImage: GraphNode<typeof RecipeGenerationState, RecipeGenerationContext> = async (
  state,
  runtime
) => {
  if (!state.imageDataUrl) return { imageKey: null, imageGenerationFailed: true }
  try {
    return {
      imageKey: await runtime.context!.imageRepository.storeDataUrl(state.imageDataUrl),
      imageGenerationFailed: false,
    }
  } catch {
    return { imageKey: null, imageGenerationFailed: true }
  }
}
