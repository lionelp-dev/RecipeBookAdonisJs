import type { MultipartFile } from '@adonisjs/core/bodyparser'

import type { ImageGenerationStatus } from './image_generation_status.js'
import type { CreateRecipeCommand, UpdateRecipeCommand } from './recipe_commands.js'
import type { GeneratedRecipe, GeneratedRecipeName } from '../schemas/generated_recipe_schema.js'

export interface RecipeGenerator {
  isConfigured(): boolean
  generateName(prompt: string, excludedNames: string[]): Promise<GeneratedRecipeName>
  generateRecipe(prompt: string, recipeName: string): Promise<GeneratedRecipe>
}

export interface RecipeImageGenerator {
  generate(recipeName: string): Promise<string | null>
}

export interface RecipeRepository {
  recipeNameExists(recipeName: string): Promise<boolean>
  persist(
    recipe: GeneratedRecipe,
    status: ImageGenerationStatus,
    imageKey?: string | null
  ): Promise<{ id: number }>
  attachImage(recipeId: number, imageKey: string): Promise<void>
  markImageGenerationFailed(recipeId: number): Promise<void>
}

export interface RecipeImageRepository {
  store(image: MultipartFile): Promise<string>
  storeDataUrl(dataUrl: string): Promise<string>
  delete(imageKey: string): Promise<void>
  url(imageKey: string): Promise<string>
}

export interface RecipeNameReservationRepository {
  reserve(recipeName: string): Promise<boolean>
  release(recipeName: string): Promise<void>
}

export interface RecipeManagementRepository {
  paginate(
    page: number,
    perPage: number
  ): Promise<{
    all(): unknown[]
    total: number
    currentPage: number
    lastPage: number
  }>
  findWithRelations(id: number | string): Promise<unknown>
  createManual(command: CreateRecipeCommand, imageKey: string | null): Promise<void>
  updateManual(
    id: number | string,
    command: UpdateRecipeCommand,
    newImageKey: string | null
  ): Promise<string | null>
  deleteById(id: number | string): Promise<string | null>
}
