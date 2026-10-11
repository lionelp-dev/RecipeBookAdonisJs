import type { GraphNode } from '@langchain/langgraph'

import type { RecipeImageContext } from '../contexts/recipe_graph_context.js'
import { type RecipeImageState } from '../state/recipe_image_state.js'

export const generateImage: GraphNode<typeof RecipeImageState, RecipeImageContext> = async (
  state,
  runtime
) => {
  if (!state.generatedRecipe) return { imageDataUrl: null, imageGenerationFailed: true }
  const imageDataUrl = await runtime.context!.imageGenerator.generate(state.generatedRecipe.name)
  return { imageDataUrl, imageGenerationFailed: imageDataUrl === null }
}
