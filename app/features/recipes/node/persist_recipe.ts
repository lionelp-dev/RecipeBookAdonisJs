import type { GraphNode } from '@langchain/langgraph'

import type { RecipeGenerationContext } from '../contexts/recipe_graph_context.js'
import { type RecipeGenerationState } from '../state/recipe_generation_state.js'

export const persistRecipe: GraphNode<
  typeof RecipeGenerationState,
  RecipeGenerationContext
> = async (state, runtime) => {
  if (!state.generatedRecipe) throw new Error('La recette générée est absente du workflow.')
  try {
    const recipe = await runtime.context!.recipeRepository.persist(
      state.generatedRecipe,
      state.generateImages ? 'pending' : 'not_requested'
    )
    return { persistedRecipeId: recipe.id }
  } catch (error) {
    if (state.generatedRecipeName)
      await runtime
        .context!.recipeNameReservations.release(state.generatedRecipeName)
        .catch(() => undefined)
    throw error
  }
}
