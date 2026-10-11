import type { GraphNode } from '@langchain/langgraph'

import type { RecipeCandidateContext } from '../../contexts/recipe_graph_context.js'
import { type RecipeCandidateState } from '../../state/recipe_candidate_state.js'

export const reserveRecipeName: GraphNode<
  typeof RecipeCandidateState,
  RecipeCandidateContext
> = async (state, runtime) => {
  if (!state.generatedRecipeName)
    throw new Error('Le nom de recette généré est absent du workflow.')
  const hasReservedRecipeName = await runtime.context!.recipeNameReservations.reserve(
    state.generatedRecipeName
  )
  return {
    hasReservedRecipeName,
    excludedRecipeNames: hasReservedRecipeName
      ? state.excludedRecipeNames
      : [...state.excludedRecipeNames, state.generatedRecipeName],
  }
}
