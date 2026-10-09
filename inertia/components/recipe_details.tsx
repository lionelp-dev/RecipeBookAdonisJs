import { Form, Link } from '@adonisjs/inertia/react'
import { Clock3, Pencil, Trash2, UtensilsCrossed } from 'lucide-react'

export type RecipeIngredient = {
  id: number
  name: string
  quantity: number
  unit: string | null
  position: number
}

export type Recipe = {
  id: number
  name: string
  description: string | null
  preparationTime: number
  cookingTime: number
  ingredients: RecipeIngredient[]
}

export function RecipeDetails({ recipe }: { recipe: Recipe }) {
  const totalTime = recipe.preparationTime + recipe.cookingTime

  return (
    <aside
      className="order-1 flex min-h-0 flex-col overflow-y-auto bg-white px-6 py-4 sm:px-10 sm:py-6"
      aria-labelledby="recipe-detail-title"
    >
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col">
        <div className="h-44 shrink-0 rounded-xl bg-stone-200 shadow-sm sm:h-52" />

        <div className="flex flex-1 flex-col px-1 pb-6 pt-4">
          <h1
            id="recipe-detail-title"
            className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl"
          >
            {recipe.name}
          </h1>

          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-500">
            <div className="flex items-center gap-2">
              <Clock3 aria-hidden="true" size={16} className="text-stone-400" />
              <dd>{totalTime} min</dd>
            </div>
            <div className="flex items-center gap-2">
              <UtensilsCrossed aria-hidden="true" size={16} className="text-stone-400" />
              <dd>
                {recipe.ingredients.length} ingrédient{recipe.ingredients.length === 1 ? '' : 's'}
              </dd>
            </div>
          </dl>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-500">
            {recipe.description || 'Aucune description disponible.'}
          </p>

          <div className="mt-5 flex-1 border-t border-stone-200 pt-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-stone-900">Ingrédients</h2>
              <span className="text-xs text-stone-400">Liste indicative</span>
            </div>

            {recipe.ingredients.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">Aucun ingrédient pour le moment.</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {recipe.ingredients.map((ingredient) => (
                  <li
                    key={ingredient.id}
                    className="flex items-center justify-between gap-3 rounded-md px-1 py-1.5 text-sm text-stone-600"
                  >
                    <span className="truncate">{ingredient.name}</span>
                    <span className="shrink-0">
                      {formatQuantity(ingredient.quantity)}
                      {ingredient.unit ? ` ${ingredient.unit}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <Form
              route="recipes.destroy"
              routeParams={{ id: recipe.id }}
              onBefore={() => window.confirm(`Supprimer la recette « ${recipe.name} » ?`)}
            >
              {({ processing }) => (
                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 aria-hidden="true" size={16} />
                  {processing ? 'Suppression…' : 'Supprimer la recette'}
                </button>
              )}
            </Form>
            <Link
              route="recipes.edit"
              routeParams={{ id: recipe.id }}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
            >
              <Pencil aria-hidden="true" size={16} />
              Modifier la recette
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value)
}
