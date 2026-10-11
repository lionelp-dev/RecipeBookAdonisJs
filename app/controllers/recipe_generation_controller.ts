import GenerateRecipesUseCase from '#features/recipes/use_cases/generate_recipes_use_case'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import z from 'zod'

const requestSchema = z.object({
  prompt: z.string().trim().min(3).max(5000),
  count: z.number().int().min(1).max(10).default(1),
  generateImages: z.boolean().default(false),
})

@inject()
export default class RecipeGenerationController {
  constructor(private readonly generateRecipes: GenerateRecipesUseCase) {}

  async store({ request, response, session }: HttpContext) {
    const validatedRequest = requestSchema.safeParse(request.all())
    if (!validatedRequest.success) {
      session.flash('inputErrorsBag', z.flattenError(validatedRequest.error).fieldErrors)
      return response.redirect().back()
    }
    if (!this.generateRecipes.isConfigured()) {
      session.flash('inputErrorsBag', {
        prompt: ['La génération IA n’est pas configurée sur ce serveur.'],
      })
      return response.redirect().back()
    }

    const { persistedRecipeCount, failedRecipeCount } = await this.generateRecipes.execute(
      validatedRequest.data
    )

    const persistedMessage = persistedRecipeCount
      ? `${persistedRecipeCount} recette${persistedRecipeCount > 1 ? 's ont été' : ' a été'} générée${persistedRecipeCount > 1 ? 's' : ''}.`
      : 'Aucune recette n’a été générée.'
    session.flash(
      'success',
      failedRecipeCount
        ? `${persistedMessage} ${failedRecipeCount} recette${failedRecipeCount > 1 ? 's n’ont pas pu être générées' : ' n’a pas pu être générée'}.`
        : persistedMessage
    )
    return response.redirect().toRoute('home')
  }
}
