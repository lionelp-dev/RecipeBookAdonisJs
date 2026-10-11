import z from 'zod'

import type {
  RecipeGenerator,
  RecipeImageGenerator,
  RecipeImageRepository,
  RecipeNameReservationRepository,
  RecipeRepository,
} from '../contracts/recipe_contracts.js'

export const RecipeCandidateContextSchema = z.object({
  recipeGenerator: z.custom<RecipeGenerator>(),
  recipeRepository: z.custom<Pick<RecipeRepository, 'recipeNameExists'>>(),
  recipeNameReservations: z.custom<RecipeNameReservationRepository>(),
})

export const RecipeImageContextSchema = z.object({
  imageGenerator: z.custom<RecipeImageGenerator>(),
})

export const RecipeGenerationContextSchema = RecipeCandidateContextSchema.extend({
  recipeRepository: z.custom<RecipeRepository>(),
  imageGenerator: z.custom<RecipeImageGenerator>(),
  imageRepository: z.custom<RecipeImageRepository>(),
})

export const RecipeDiscoveryContextSchema = RecipeCandidateContextSchema.extend({
  imageGenerator: z.custom<RecipeImageGenerator>(),
})

export type RecipeCandidateContext = z.infer<typeof RecipeCandidateContextSchema>
export type RecipeImageContext = z.infer<typeof RecipeImageContextSchema>
export type RecipeGenerationContext = z.infer<typeof RecipeGenerationContextSchema>
export type RecipeDiscoveryContext = z.infer<typeof RecipeDiscoveryContextSchema>
