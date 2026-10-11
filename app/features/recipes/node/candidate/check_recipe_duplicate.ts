import type { GraphNode } from '@langchain/langgraph'

import type { RecipeCandidateContext } from '../../contexts/recipe_graph_context.js'
import { type RecipeCandidateState } from '../../state/recipe_candidate_state.js'

export const checkRecipeDuplicate: GraphNode<
  typeof RecipeCandidateState,
  RecipeCandidateContext
> = async (state, runtime) => {
  if (!state.generatedRecipeName)
    throw new Error('Le nom de recette généré est absent du workflow.')
  const isDuplicateRecipe = await runtime.context!.recipeRepository.recipeNameExists(
    state.generatedRecipeName
  )
  return {
    isDuplicateRecipe,
    excludedRecipeNames: isDuplicateRecipe
      ? [...state.excludedRecipeNames, state.generatedRecipeName]
      : state.excludedRecipeNames,
  }
}
