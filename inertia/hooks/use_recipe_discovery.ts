import { router, usePage } from '@inertiajs/react'
import { useEffect, useRef, useState } from 'react'

export type DiscoveredRecipe = {
  name: string
  description: string | null
  preparationTime: number
  cookingTime: number
  ingredients: { name: string; quantity: number; unit: string | null }[]
  steps: { instruction: string }[]
  imageDataUrl: string | null
  imageGenerationFailed: boolean
}

export type DiscoveryPool = {
  recipes: DiscoveredRecipe[]
  failedRecipeCount: number
}

type DiscoveryPageProps = { discoveryPool?: DiscoveryPool }

type UseRecipeDiscoveryOptions = {
  onRecipeSaved: (recipeId: number, recipeName: string) => void
  onPendingRecipesChange: (count: number) => void
  onPoolGenerationChange: (isGenerating: boolean) => void
  onPreparationChange: (hasPreparation: boolean) => void
}

export function useRecipeDiscovery({
  onRecipeSaved,
  onPendingRecipesChange,
  onPoolGenerationChange,
  onPreparationChange,
}: UseRecipeDiscoveryOptions) {
  const csrfToken = (usePage().props as unknown as { csrfToken?: string }).csrfToken
  const [prompt, setPrompt] = useState('')
  const [maxDuration, setMaxDuration] = useState<string | null>(null)
  const [diet, setDiet] = useState<string | null>(null)
  const [style, setStyle] = useState<string | null>(null)
  const [recipes, setRecipes] = useState<DiscoveredRecipe[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPrefetching, setIsPrefetching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSkipping, setIsSkipping] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const swipesRef = useRef(0)
  const poolRequestInFlight = useRef(false)
  const currentRecipe = recipes[0] ?? null

  useEffect(() => {
    onPendingRecipesChange(recipes.length)
  }, [onPendingRecipesChange, recipes.length])

  useEffect(() => {
    onPoolGenerationChange(isGenerating || isPrefetching)
  }, [isGenerating, isPrefetching, onPoolGenerationChange])

  useEffect(() => {
    onPreparationChange(
      prompt.trim().length > 0 || maxDuration !== null || diet !== null || style !== null
    )
  }, [diet, maxDuration, onPreparationChange, prompt, style])

  function selectDuration(option: string) {
    const next = maxDuration === option ? null : option
    setPrompt((current) =>
      replacePromptPreference(
        current,
        preferencePhrase('duration', maxDuration),
        preferencePhrase('duration', next)
      )
    )
    setMaxDuration(next)
  }

  function selectDiet(option: string) {
    const next = diet === option ? null : option
    setPrompt((current) =>
      replacePromptPreference(
        current,
        preferencePhrase('diet', diet),
        preferencePhrase('diet', next)
      )
    )
    setDiet(next)
  }

  function selectStyle(option: string) {
    const next = style === option ? null : option
    setPrompt((current) =>
      replacePromptPreference(
        current,
        preferencePhrase('style', style),
        preferencePhrase('style', next)
      )
    )
    setStyle(next)
  }

  function requestPool(prefetch: boolean) {
    const recipePrompt = prompt.trim()
    if (!recipePrompt || poolRequestInFlight.current) return

    poolRequestInFlight.current = true
    setError(null)
    if (prefetch) setIsPrefetching(true)
    else setIsGenerating(true)

    router.post(
      '/recipes/discover/pool',
      { prompt: recipePrompt },
      {
        async: true,
        preserveScroll: true,
        preserveState: true,
        only: ['discoveryPool'],
        headers: csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {},
        onError: () => setError('La génération des recettes a échoué.'),
        onSuccess: (page) => {
          const pool = (page.props as unknown as DiscoveryPageProps).discoveryPool
          if (!pool) {
            setError('Le serveur n’a retourné aucune proposition.')
            return
          }

          if (prefetch) setRecipes((current) => [...current, ...pool.recipes])
          else {
            setRecipes(pool.recipes)
            swipesRef.current = 0
            setHasStarted(true)
            setIsRefining(false)
          }
          if (pool.failedRecipeCount) {
            setNotice(`${pool.failedRecipeCount} proposition(s) n’ont pas pu être générées.`)
          }
        },
        onFinish: () => {
          poolRequestInFlight.current = false
          setIsGenerating(false)
          setIsPrefetching(false)
        },
      }
    )
  }

  function generateRecipes() {
    setNotice(null)
    requestPool(false)
  }

  function advanceToNextRecipe() {
    const isLastRecipe = recipes.length === 1
    setRecipes((current) => current.slice(1))
    const nextSwipeCount = swipesRef.current + 1
    if (nextSwipeCount === 5 || isLastRecipe) requestPool(true)
    swipesRef.current = nextSwipeCount === 10 ? 0 : nextSwipeCount
  }

  function skipCurrentRecipe() {
    if (isSkipping || isSaving) return

    setIsSkipping(true)
    window.setTimeout(() => {
      advanceToNextRecipe()
      setIsSkipping(false)
    }, 300)
  }

  function saveCurrentRecipe() {
    if (!currentRecipe || isSaving) return

    setIsSaving(true)
    setError(null)
    const { imageDataUrl, imageGenerationFailed, ...recipe } = currentRecipe
    router.post(
      '/recipes/discover/save',
      { recipe, imageDataUrl },
      {
        async: true,
        preserveScroll: true,
        preserveState: true,
        only: ['savedRecipeId'],
        headers: csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {},
        onError: () => setError('La recette n’a pas pu être sauvegardée.'),
        onSuccess: (page) => {
          const savedRecipeId = (page.props as unknown as { savedRecipeId?: number }).savedRecipeId
          if (savedRecipeId) onRecipeSaved(savedRecipeId, currentRecipe.name)
          advanceToNextRecipe()
        },
        onFinish: () => setIsSaving(false),
      }
    )
  }

  return {
    currentRecipe,
    diet,
    error,
    hasStarted,
    isGenerating,
    isPrefetching,
    isRefining,
    isSaving,
    isSkipping,
    maxDuration,
    notice,
    prompt,
    style,
    generateRecipes,
    retryPrefetch: () => requestPool(true),
    saveCurrentRecipe,
    selectDiet,
    selectDuration,
    selectStyle,
    setIsRefining,
    setPrompt,
    skipCurrentRecipe,
  }
}

function preferencePhrase(kind: 'duration' | 'diet' | 'style', value: string | null) {
  if (!value || (kind === 'duration' && value === 'Peu importe')) return null
  if (kind === 'duration') return `à préparer en moins de ${value}`
  return value.toLowerCase()
}

function replacePromptPreference(
  prompt: string,
  previousPhrase: string | null,
  nextPhrase: string | null
) {
  const parts = prompt
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part && part !== previousPhrase)
  if (nextPhrase) parts.push(nextPhrase)
  return parts.join(', ')
}
