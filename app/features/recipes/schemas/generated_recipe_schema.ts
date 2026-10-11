import z from 'zod'

export const generatedRecipeNameSchema = z.object({
  name: z.string().trim().min(1).max(100),
})

export const generatedRecipeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(1000).nullable(),
  preparationTime: z.number().int().nonnegative(),
  cookingTime: z.number().int().nonnegative(),
  ingredients: z.array(
    z.object({
      name: z.string().trim().min(1).max(100),
      quantity: z.number().positive(),
      unit: z.string().trim().max(50).nullable(),
    })
  ),
  steps: z.array(z.object({ instruction: z.string().trim().min(1).max(2000) })).min(1),
})

export type GeneratedRecipe = z.infer<typeof generatedRecipeSchema>
export type GeneratedRecipeName = z.infer<typeof generatedRecipeNameSchema>
