import { router } from '@inertiajs/react'
import { useCallback, useState } from 'react'
import type { Recipe } from '~/components/recipe_details'

type UseRecipesOptions = {
  initialRecipes: Recipe[]
  initialTotalItems: number
  initialCurrentPage: number
  initialLastPage: number
}

type RecipesPageProps = {
  recipes: Recipe[]
  totalItems: number
  currentPage: number
  lastPage: number
}

export function useRecipes({
  initialRecipes,
  initialTotalItems,
  initialCurrentPage,
  initialLastPage,
}: UseRecipesOptions) {
  const [recipes, setRecipes] = useState(initialRecipes)
  const [totalItems, setTotalItems] = useState(initialTotalItems)
  const [currentPage, setCurrentPage] = useState(initialCurrentPage)
  const [lastPage, setLastPage] = useState(initialLastPage)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<Error | null>(null)

  const loadMore = useCallback(() => {
    if (isLoadingMore || currentPage >= lastPage) return

    setIsLoadingMore(true)
    setLoadMoreError(null)

    router.get(
      '/',
      { page: currentPage + 1 },
      {
        only: ['recipes', 'totalItems', 'currentPage', 'lastPage'],
        preserveScroll: true,
        preserveState: true,
        preserveUrl: true,
        onSuccess: (page) => {
          const props = page.props as unknown as RecipesPageProps

          setRecipes((current) => deduplicateRecipes([...current, ...props.recipes]))
          setTotalItems(props.totalItems)
          setCurrentPage(props.currentPage)
          setLastPage(props.lastPage)
        },
        onError: () => setLoadMoreError(new Error('Le chargement des recettes a échoué.')),
        onFinish: () => setIsLoadingMore(false),
      }
    )
  }, [currentPage, isLoadingMore, lastPage])

  return {
    recipes,
    totalItems,
    isLoadingMore,
    hasNextPage: currentPage < lastPage,
    loadMoreError,
    loadMore,
  }
}

function deduplicateRecipes(recipes: Recipe[]) {
  const seenRecipeIds = new Set<number>()

  return recipes.filter((recipe) => {
    if (seenRecipeIds.has(recipe.id)) return false
    seenRecipeIds.add(recipe.id)
    return true
  })
}
