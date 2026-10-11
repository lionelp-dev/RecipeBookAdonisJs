import type { Data } from '@generated/data'
import { usePoll } from '@inertiajs/react'
import { AppHeader } from '~/components/app_header'
import { DiscoveryPausedBanner } from '~/components/recipe_discovery/discovery_paused_banner'
import { RecipeDiscoveryPanel } from '~/components/recipe_discovery_panel'
import { RecipeDetails, type Recipe } from '~/components/recipe_details'
import { RecipeList } from '~/components/recipe_list'
import { useDiscoverySession } from '~/hooks/use_discovery_session'
import type { DiscoveryPool } from '~/hooks/use_recipe_discovery'
import { useRecipes, type RecipesPageProps } from '~/hooks/use_recipes'
import type { InertiaProps } from '~/types'

type HomeProps = InertiaProps<{
  recipes: Data.Recipe[]
  totalItems: number
  currentPage: number
  lastPage: number
  discoveryPool?: DiscoveryPool
  savedRecipeId?: number
}>

export default function Home(props: HomeProps) {
  return <RecipeScreen {...props} />
}

function RecipeScreen({ recipes: initialRecipes, totalItems, currentPage, lastPage }: HomeProps) {
  const {
    recipes,
    totalItems: recipeCount,
    isLoadingMore,
    hasNextPage,
    loadMoreError,
    loadMore,
    refreshRecipes,
  } = useRecipes({
    initialRecipes: initialRecipes as Recipe[],
    initialTotalItems: totalItems,
    initialCurrentPage: currentPage,
    initialLastPage: lastPage,
  })

  usePoll(5_000, {
    only: ['recipes', 'totalItems', 'currentPage', 'lastPage'],
    onSuccess: (page) => refreshRecipes(page.props as unknown as RecipesPageProps),
  })

  const {
    discoverySessionKey,
    hasPausedDiscovery,
    isDiscovering,
    recentlyAddedRecipeId,
    selectedRecipe,
    handlePendingRecipesChange,
    handlePoolGenerationChange,
    handlePreparationChange,
    handleRecipeSaved,
    handleRecipeSelected,
    resumeDiscovery,
    toggleDiscovery,
  } = useDiscoverySession({ recipes: recipes as Recipe[], refreshRecipes })

  return (
    <div className="h-[100dvh] overflow-hidden bg-stone-50 text-stone-950">
      <AppHeader
        currentPage="Mes recettes"
        onDiscover={toggleDiscovery}
        isDiscovering={isDiscovering || hasPausedDiscovery}
      />

      <main className="mx-auto flex h-[calc(100dvh-4.125rem)] min-h-0 w-full max-w-7xl flex-col px-4 sm:px-6">
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white shadow-sm">
          {hasPausedDiscovery && <DiscoveryPausedBanner onResume={resumeDiscovery} />}
          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1.12fr)_minmax(16rem,0.88fr)]">
            <div className={isDiscovering ? 'hidden' : 'contents'}>
              {selectedRecipe ? (
                <RecipeDetails recipe={selectedRecipe as Recipe} />
              ) : (
                <section className="order-1 flex min-h-64 items-center justify-center px-6 py-12 text-center">
                  <div>
                    <p className="text-lg font-semibold text-stone-900">Choisissez une recette</p>
                    <p className="mt-2 text-sm text-stone-500">
                      Sélectionnez une recette dans votre carnet pour voir ses détails.
                    </p>
                  </div>
                </section>
              )}
            </div>
            <RecipeDiscoveryPanel
              key={discoverySessionKey}
              isActive={isDiscovering}
              onRecipeSaved={handleRecipeSaved}
              onPendingRecipesChange={handlePendingRecipesChange}
              onPoolGenerationChange={handlePoolGenerationChange}
              onPreparationChange={handlePreparationChange}
            />
            <RecipeList
              recipes={recipes as Recipe[]}
              totalItems={recipeCount}
              selectedRecipeId={selectedRecipe?.id ?? null}
              recentlyAddedRecipeId={recentlyAddedRecipeId}
              isLoadingMore={isLoadingMore}
              hasNextPage={hasNextPage}
              loadMoreError={loadMoreError}
              onLoadMore={loadMore}
              onSelect={handleRecipeSelected}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
