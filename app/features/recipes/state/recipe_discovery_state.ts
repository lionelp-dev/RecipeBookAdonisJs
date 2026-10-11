import { StateSchema } from '@langchain/langgraph'

import { RecipeCandidateState } from './recipe_candidate_state.js'
import { RecipeImageState } from './recipe_image_state.js'

export const RecipeDiscoveryState = new StateSchema({
  ...RecipeCandidateState.fields,
  ...RecipeImageState.fields,
})
