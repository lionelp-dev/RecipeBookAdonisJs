import { router } from '@inertiajs/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { Recipe } from '~/components/recipe_details'
import type { RecipesPageProps } from '~/hooks/use_recipes'

type UseDiscoverySessionOptions = {
  recipes: Recipe[]
  refreshRecipes: (page: RecipesPageProps) => void
}

export function useDiscoverySession({ recipes, refreshRecipes }: UseDiscoverySessionOptions) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null)
  const [isRecipePreviewEmpty, setIsRecipePreviewEmpty] = useState(false)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [canReturnToDiscovery, setCanReturnToDiscovery] = useState(false)
  const [recipeIdBeforeDiscovery, setRecipeIdBeforeDiscovery] = useState<number | null>(null)
  const [hasDiscoveryPreparation, setHasDiscoveryPreparation] = useState(false)
  const [pendingDiscoveryCount, setPendingDiscoveryCount] = useState(0)
  const [isDiscoveryPoolGenerating, setIsDiscoveryPoolGenerating] = useState(false)
  const [discoverySessionKey, setDiscoverySessionKey] = useState(0)
  const [recentlyAddedRecipeId, setRecentlyAddedRecipeId] = useState<number | null>(null)

  const selectedRecipe = useMemo(
    () =>
      isDiscovering || isRecipePreviewEmpty
        ? null
        : (recipes.find((recipe) => recipe.id === selectedRecipeId) ?? recipes[0] ?? null),
    [isDiscovering, isRecipePreviewEmpty, recipes, selectedRecipeId]
  )

  useEffect(() => {
    if (recentlyAddedRecipeId === null) return

    const timeout = window.setTimeout(() => setRecentlyAddedRecipeId(null), 5_000)
    return () => window.clearTimeout(timeout)
  }, [recentlyAddedRecipeId])

  const hasPausedDiscovery =
    !isDiscovering &&
    canReturnToDiscovery &&
    (pendingDiscoveryCount > 0 || isDiscoveryPoolGenerating)

  const quitDiscovery = useCallback(() => {
    if (
      hasDiscoveryPreparation &&
      !window.confirm(
        'Quitter la découverte abandonnera votre demande et vos critères. Continuer ?'
      )
    ) {
      return
    }

    setCanReturnToDiscovery(false)
    setPendingDiscoveryCount(0)
    setIsDiscovering(false)
    setHasDiscoveryPreparation(false)
    if (recipeIdBeforeDiscovery === null) {
      setIsRecipePreviewEmpty(true)
    } else {
      setSelectedRecipeId(recipeIdBeforeDiscovery)
      setIsRecipePreviewEmpty(false)
    }
    setRecipeIdBeforeDiscovery(null)
    setDiscoverySessionKey((key) => key + 1)
  }, [hasDiscoveryPreparation, recipeIdBeforeDiscovery])

  const toggleDiscovery = useCallback(() => {
    if (isDiscovering || hasPausedDiscovery) {
      quitDiscovery()
      return
    }

    setRecipeIdBeforeDiscovery(selectedRecipe?.id ?? null)
    setCanReturnToDiscovery(true)
    setIsDiscovering(true)
  }, [hasPausedDiscovery, isDiscovering, quitDiscovery, selectedRecipe?.id])

  const resumeDiscovery = useCallback(() => setIsDiscovering(true), [])

  const handleRecipeSaved = useCallback(
    (recipeId: number, recipeName: string) => {
      setRecentlyAddedRecipeId(recipeId)
      router.reload({
        only: ['recipes', 'totalItems', 'currentPage', 'lastPage'],
        onSuccess: (page) => {
          refreshRecipes(page.props as unknown as RecipesPageProps)
          toast.success(`« ${recipeName} » a été ajoutée à vos recettes.`)
        },
      })
    },
    [refreshRecipes]
  )

  const handleRecipeSelected = useCallback(
    (recipe: Recipe) => {
      setSelectedRecipeId(recipe.id)
      setIsRecipePreviewEmpty(false)
      if (isDiscovering) setCanReturnToDiscovery(true)
      setIsDiscovering(false)
    },
    [isDiscovering]
  )

  const handlePendingRecipesChange = useCallback((count: number) => {
    setPendingDiscoveryCount(count)
  }, [])

  const handlePoolGenerationChange = useCallback((isGenerating: boolean) => {
    setIsDiscoveryPoolGenerating(isGenerating)
  }, [])

  const handlePreparationChange = useCallback((hasPreparation: boolean) => {
    setHasDiscoveryPreparation(hasPreparation)
  }, [])

  return {
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
  }
}
