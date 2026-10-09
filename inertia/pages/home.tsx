import type { Data } from '@generated/data'
import { useMemo, useState } from 'react'
import { AppHeader } from '~/components/app_header'
import { RecipeDetails, type Recipe } from '~/components/recipe_details'
import { RecipeList } from '~/components/recipe_list'
import { useRecipes } from '~/hooks/use_recipes'
import type { InertiaProps } from '~/types'

type HomeProps = InertiaProps<{
  recipes: Data.Recipe[]
  totalItems: number
  currentPage: number
  lastPage: number
}>

export default function Home(props: HomeProps) {
  return <RecipeScreen {...props} />
}

function RecipeScreen({ recipes: initialRecipes, totalItems, currentPage, lastPage }: HomeProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null)
  const {
    recipes,
    totalItems: recipeCount,
    isLoadingMore,
    hasNextPage,
    loadMoreError,
    loadMore,
  } = useRecipes({
    initialRecipes: initialRecipes as Recipe[],
    initialTotalItems: totalItems,
    initialCurrentPage: currentPage,
    initialLastPage: lastPage,
  })

  const selectedRecipe = useMemo(
    () => recipes.find((recipe) => recipe.id === selectedRecipeId) ?? recipes[0] ?? null,
    [recipes, selectedRecipeId]
  )

  return (
    <div className="h-[100dvh] overflow-hidden bg-stone-50 text-stone-950">
      <AppHeader currentPage="Mes recettes" />

      <main className="mx-auto flex h-[calc(100dvh-4.125rem)] min-h-0 w-full max-w-7xl flex-col px-4 sm:px-6">
        <section className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden bg-white shadow-sm lg:grid-cols-[minmax(0,1.12fr)_minmax(16rem,0.88fr)]">
          {selectedRecipe ? (
            <RecipeDetails recipe={selectedRecipe as Recipe} />
          ) : (
            <section className="order-1 flex min-h-64 items-center justify-center px-6 py-12 text-center">
              <div>
                <p className="text-lg font-semibold text-stone-900">Choisissez une recette</p>
                <p className="mt-2 text-sm text-stone-500">Son détail s’affichera ici.</p>
              </div>
            </section>
          )}

          <RecipeList
            recipes={recipes as Recipe[]}
            totalItems={recipeCount}
            selectedRecipeId={selectedRecipe?.id ?? null}
            isLoadingMore={isLoadingMore}
            hasNextPage={hasNextPage}
            loadMoreError={loadMoreError}
            onLoadMore={loadMore}
            onSelect={(recipe) => setSelectedRecipeId(recipe.id)}
          />
        </section>
      </main>
    </div>
  )
}
