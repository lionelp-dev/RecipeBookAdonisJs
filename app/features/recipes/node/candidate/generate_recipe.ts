import type { GraphNode } from '@langchain/langgraph'

import type { RecipeCandidateContext } from '../../contexts/recipe_graph_context.js'
import { type RecipeCandidateState } from '../../state/recipe_candidate_state.js'

export const generateRecipe: GraphNode<
  typeof RecipeCandidateState,
  RecipeCandidateContext
> = async (state, runtime) => {
  if (!state.generatedRecipeName)
    throw new Error('Le nom de recette généré est absent du workflow.')
  try {
    return {
      generatedRecipe: await runtime.context!.recipeGenerator.generateRecipe(
        state.prompt,
        state.generatedRecipeName
      ),
    }
  } catch (error) {
    await runtime
      .context!.recipeNameReservations.release(state.generatedRecipeName)
      .catch(() => undefined)
    throw error
  }
}
