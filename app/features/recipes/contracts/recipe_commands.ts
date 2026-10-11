import type { MultipartFile } from '@adonisjs/core/bodyparser'

export type RecipeIngredientCommand = { name: string; quantity: number; unit: string | null }
export type RecipeStepCommand = { instruction: string }

export type RecipeCommand = {
  name: string
  description: string | null
  preparationTime: number
  cookingTime: number
  ingredients: RecipeIngredientCommand[]
  steps: RecipeStepCommand[]
}

export type CreateRecipeCommand = RecipeCommand & { image?: MultipartFile }
export type UpdateRecipeCommand = RecipeCommand & { image?: MultipartFile; removeImage?: boolean }
