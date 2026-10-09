import Recipe from '#models/recipe'
import RecipeIngredient from '#models/recipe_ingredient'
import RecipeStep from '#models/recipe_step'
import type { ImageGenerationStatus } from '#models/recipe'
import type { GeneratedRecipe } from '#services/recipe-generation/generated_recipe'
import db from '@adonisjs/lucid/services/db'

export default class PersistGeneratedRecipeService {
  async persist(
    generatedRecipe: GeneratedRecipe,
    imageGenerationStatus: ImageGenerationStatus
  ): Promise<Recipe> {
    return db.transaction(async (trx) => {
      const recipe = await Recipe.create(
        {
          name: generatedRecipe.name,
          description: generatedRecipe.description,
          preparationTime: generatedRecipe.preparationTime,
          cookingTime: generatedRecipe.cookingTime,
          imageKey: null,
          imageGenerationStatus,
        },
        { client: trx }
      )
      await RecipeIngredient.createMany(
        generatedRecipe.ingredients.map((ingredient, position) => ({
          ...ingredient,
          recipeId: recipe.id,
          position,
        })),
        { client: trx }
      )
      await RecipeStep.createMany(
        generatedRecipe.steps.map((step, position) => ({
          ...step,
          recipeId: recipe.id,
          position,
        })),
        { client: trx }
      )

      return recipe
    })
  }

  async attachImage(recipeId: number, imageKey: string) {
    const recipe = await Recipe.findOrFail(recipeId)
    recipe.imageKey = imageKey
    recipe.imageGenerationStatus = 'ready'
    await recipe.save()
  }

  async markImageGenerationFailed(recipeId: number) {
    const recipe = await Recipe.findOrFail(recipeId)
    recipe.imageGenerationStatus = 'failed'
    await recipe.save()
  }

  async recipeNameExists(recipeName: string) {
    const recipe = await Recipe.query()
      .whereRaw('LOWER(name) = LOWER(?)', [recipeName.trim()])
      .first()

    return Boolean(recipe)
  }
}
