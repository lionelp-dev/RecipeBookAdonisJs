import { StateSchema } from '@langchain/langgraph'
import z from 'zod'

import { generatedRecipeSchema } from '../schemas/generated_recipe_schema.js'

export const RecipeCandidateState = new StateSchema({
  prompt: z.string(),
  generatedRecipeName: z.string().nullable().default(null),
  generatedRecipe: generatedRecipeSchema.nullable().default(null),
  excludedRecipeNames: z.array(z.string()).default([]),
  generationAttempts: z.number().int().default(0),
  isDuplicateRecipe: z.boolean().default(false),
  hasReservedRecipeName: z.boolean().default(false),
})
