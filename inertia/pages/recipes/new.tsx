import { AppHeader } from '~/components/app_header'
import { RecipeForm } from '~/components/recipe_form'

export default function NewRecipe() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <AppHeader currentPage="Nouvelle recette" />
      <main className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:py-6">
        <RecipeForm
          action={{ route: 'recipes.store', resetOnSuccess: true }}
          initialValues={{
            name: '',
            description: null,
            preparationTime: 0,
            cookingTime: 0,
            ingredients: [],
          }}
          submitLabel="Créer la recette"
          submittingLabel="Enregistrement…"
        />
      </main>
    </div>
  )
}
