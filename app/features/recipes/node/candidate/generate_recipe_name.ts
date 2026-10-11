import type { GraphNode } from '@langchain/langgraph'

import type { RecipeCandidateContext } from '../../contexts/recipe_graph_context.js'
import { type RecipeCandidateState } from '../../state/recipe_candidate_state.js'

export const generateRecipeName: GraphNode<
  typeof RecipeCandidateState,
  RecipeCandidateContext
> = async (state, runtime) => {
  const recipeName = await runtime.context!.recipeGenerator.generateName(
    state.prompt,
    state.excludedRecipeNames
  )
  return {
    generatedRecipeName: recipeName.name,
    generationAttempts: state.generationAttempts + 1,
    isDuplicateRecipe: false,
  }
}
