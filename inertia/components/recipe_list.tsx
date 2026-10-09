import type { Recipe } from '~/components/recipe_details'
import { useLoadMoreOnIntersect } from '~/hooks/use_load_more_on_intersect'
import type { RecipesPageProps } from '~/hooks/use_recipes'
import { RecipeGenerationModal } from '~/components/recipe_generation_modal'
import { Sparkles } from 'lucide-react'

type RecipeListProps = {
  recipes: Recipe[]
  totalItems: number
  selectedRecipeId: number | null
  isLoadingMore: boolean
  isGeneratingRecipe: boolean
  hasNextPage: boolean
  loadMoreError: Error | null
  onLoadMore: () => void
  onGenerationStatusChange: (isGenerating: boolean) => void
  onRecipesUpdated: (page: RecipesPageProps) => void
  onSelect: (recipe: Recipe) => void
}

export function RecipeList({
  recipes,
  totalItems,
  selectedRecipeId,
  isLoadingMore,
  isGeneratingRecipe,
  hasNextPage,
  loadMoreError,
  onLoadMore,
  onGenerationStatusChange,
  onRecipesUpdated,
  onSelect,
}: RecipeListProps) {
  const loadMoreRef = useLoadMoreOnIntersect({ hasNextPage, isLoadingMore, onLoadMore })

  return (
    <section
      aria-labelledby="recipes-title"
      data-scroll-container
      className="order-2 min-h-0 min-w-0 overflow-y-auto bg-white px-3 py-5 sm:px-5"
    >
      <div className="sticky -top-5 z-10 -mx-3 mb-3 flex items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 py-3 sm:-mx-5 sm:px-6">
        <h1 id="recipes-title" className="text-base font-bold tracking-tight text-stone-900">
          Recettes <span className="font-medium text-stone-400">({totalItems})</span>
        </h1>
        <RecipeGenerationModal
          onGenerationStatusChange={onGenerationStatusChange}
          onRecipesUpdated={onRecipesUpdated}
        />
      </div>

      {recipes.length === 0 && !isGeneratingRecipe ? (
        <div className="mx-1 rounded-xl border border-dashed border-stone-300 px-5 py-10 text-center">
          <h2 className="text-sm font-bold text-stone-900">Aucune recette pour le moment</h2>
          <p className="mt-2 text-sm text-stone-500">
            Créez une recette pour commencer votre carnet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {isGeneratingRecipe && (
            <div
              aria-live="polite"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left"
            >
              <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500">
                <Sparkles aria-hidden="true" className="animate-pulse" size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                  <span className="size-3 animate-spin rounded-full border-2 border-stone-300 border-t-stone-700" />
                  Recette en cours de génération…
                </span>
                <span className="mt-1 block text-xs text-stone-400">
                  Les détails apparaîtront automatiquement.
                </span>
              </span>
            </div>
          )}
          {recipes.map((recipe) => {
            const isSelected = selectedRecipeId === recipe.id

            return (
              <button
                key={recipe.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(recipe)}
                className={`flex w-full appearance-none items-center gap-3 rounded-lg border-0 px-3 py-2.5 text-left shadow-none outline-none ring-0 transition focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                  isSelected ? 'bg-stone-100' : 'hover:bg-stone-50'
                }`}
              >
                {recipe.imageUrl ? (
                  <img
                    src={recipe.imageUrl}
                    alt=""
                    className="size-16 shrink-0 rounded-lg object-cover"
                  />
                ) : recipe.imageGenerationStatus === 'pending' ? (
                  <span
                    aria-label="Génération de l’image en cours"
                    className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-stone-100"
                  >
                    <span className="size-5 animate-spin rounded-full border-2 border-stone-300 border-t-stone-700" />
                  </span>
                ) : (
                  <span aria-hidden="true" className="size-16 shrink-0 rounded-lg bg-stone-200" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-stone-900">
                    {recipe.name}
                  </span>
                  <span className="mt-1 block text-xs text-stone-500">
                    Recette · {recipe.preparationTime + recipe.cookingTime} min
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {recipes.length > 0 && (
        <div ref={loadMoreRef} className="flex min-h-16 items-center justify-center px-3 py-4">
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-sm text-stone-500" aria-live="polite">
              <span className="size-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-700" />
              Chargement des recettes…
            </div>
          ) : loadMoreError ? (
            <div className="text-center" role="alert">
              <p className="text-sm text-red-700">{loadMoreError.message}</p>
              <button
                type="button"
                onClick={onLoadMore}
                className="mt-2 text-sm font-semibold text-stone-700 underline underline-offset-4"
              >
                Réessayer
              </button>
            </div>
          ) : !hasNextPage ? (
            <p className="text-center text-xs text-stone-400">Toutes les recettes sont chargées.</p>
          ) : null}
        </div>
      )}
    </section>
  )
}
