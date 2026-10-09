import type { Data } from '@generated/data'
import { AppHeader } from '~/components/app_header'
import { RecipeForm } from '~/components/recipe_form'
import type { InertiaProps } from '~/types'

export default function EditRecipe({ recipe }: InertiaProps<{ recipe: Data.Recipe }>) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <AppHeader currentPage="Modifier la recette" />
      <main className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:py-6">
        <RecipeForm
          action={{ route: 'recipes.update', routeParams: { id: recipe.id } }}
          initialValues={recipe}
          submitLabel="Enregistrer les modifications"
          submittingLabel="Enregistrement…"
        />
      </main>
    </div>
  )
}
