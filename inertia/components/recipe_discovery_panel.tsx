import { LoaderCircle } from 'lucide-react'
import { DiscoveryPromptForm } from '~/components/recipe_discovery/discovery_prompt_form'
import { DiscoveryRecipeCard } from '~/components/recipe_discovery/discovery_recipe_card'
import { useRecipeDiscovery } from '~/hooks/use_recipe_discovery'

type RecipeDiscoveryPanelProps = {
  isActive: boolean
  onRecipeSaved: (recipeId: number, recipeName: string) => void
  onPendingRecipesChange: (count: number) => void
  onPoolGenerationChange: (isGenerating: boolean) => void
  onPreparationChange: (hasPreparation: boolean) => void
}

export function RecipeDiscoveryPanel({
  isActive,
  onRecipeSaved,
  onPendingRecipesChange,
  onPoolGenerationChange,
  onPreparationChange,
}: RecipeDiscoveryPanelProps) {
  const {
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
    retryPrefetch,
    saveCurrentRecipe,
    selectDiet,
    selectDuration,
    selectStyle,
    setIsRefining,
    setPrompt,
    skipCurrentRecipe,
  } = useRecipeDiscovery({
    onRecipeSaved,
    onPendingRecipesChange,
    onPoolGenerationChange,
    onPreparationChange,
  })

  if (!isActive) return <section className="hidden" aria-hidden="true" />

  const showPrompt = !isGenerating && !isPrefetching && (!hasStarted || isRefining)
  return (
    <section
      className="order-1 min-h-0 overflow-y-auto bg-[#fcfbf8] px-6 py-5 sm:px-10 sm:py-7"
      aria-label="Découverte de recettes"
    >
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col">
        {(!hasStarted || isRefining) && (
          <DiscoveryPromptForm
            prompt={prompt}
            maxDuration={maxDuration}
            diet={diet}
            style={style}
            isRefining={isRefining}
            showForm={showPrompt}
            onPromptChange={setPrompt}
            onDurationSelect={selectDuration}
            onDietSelect={selectDiet}
            onStyleSelect={selectStyle}
            onSubmit={generateRecipes}
          />
        )}

        {(isGenerating || (!currentRecipe && isPrefetching)) && (
          <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <LoaderCircle className="size-8 animate-spin text-stone-500" aria-hidden="true" />
            <p className="mt-4 font-semibold text-stone-800">Création de votre sélection…</p>
            <p className="mt-1 text-sm text-stone-500">
              Les recettes et leurs images sont générées.
            </p>
          </div>
        )}

        {currentRecipe && !isRefining && (
          <DiscoveryRecipeCard
            recipe={currentRecipe}
            diet={diet}
            isSaving={isSaving}
            isSkipping={isSkipping}
            onRefine={() => setIsRefining(true)}
            onSkip={skipCurrentRecipe}
            onSave={saveCurrentRecipe}
          />
        )}

        {!currentRecipe &&
          !isGenerating &&
          !isPrefetching &&
          hasStarted &&
          !isRefining &&
          error && (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <p className="font-serif text-2xl font-bold text-stone-900">
                Impossible de charger la suite
              </p>
              <button
                type="button"
                onClick={retryPrefetch}
                className="mt-6 rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700"
              >
                Réessayer
              </button>
            </div>
          )}
        {error && (
          <p role="alert" className="mt-5 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        {notice && <p className="mt-5 text-sm font-medium text-emerald-700">{notice}</p>}
      </div>
    </section>
  )
}
