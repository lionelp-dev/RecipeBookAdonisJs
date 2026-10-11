import type { GraphNode } from '@langchain/langgraph'

import type { RecipeCandidateContext } from '../../contexts/recipe_graph_context.js'
import { type RecipeCandidateState } from '../../state/recipe_candidate_state.js'

export const releaseRecipeName: GraphNode<
  typeof RecipeCandidateState,
  RecipeCandidateContext
> = async (state, runtime) => {
  if (state.generatedRecipeName)
    await runtime
      .context!.recipeNameReservations.release(state.generatedRecipeName)
      .catch(() => undefined)
  return {}
}
