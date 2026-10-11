import { StateSchema } from '@langchain/langgraph'
import z from 'zod'

import { RecipeCandidateState } from './recipe_candidate_state.js'
import { RecipeImageState } from './recipe_image_state.js'

export const RecipeGenerationState = new StateSchema({
  generateImages: z.boolean(),
  ...RecipeCandidateState.fields,
  persistedRecipeId: z.number().int().nullable().default(null),
  ...RecipeImageState.fields,
  imageKey: z.string().nullable().default(null),
  shouldCleanupImage: z.boolean().default(false),
})
