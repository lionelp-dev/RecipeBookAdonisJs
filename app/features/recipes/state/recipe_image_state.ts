import { StateSchema } from '@langchain/langgraph'
import z from 'zod'

import { generatedRecipeSchema } from '../schemas/generated_recipe_schema.js'

export const RecipeImageState = new StateSchema({
  generatedRecipe: generatedRecipeSchema.nullable().default(null),
  imageDataUrl: z.string().nullable().default(null),
  imageGenerationFailed: z.boolean().default(false),
})
