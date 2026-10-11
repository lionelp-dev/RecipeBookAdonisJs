import {
  Clock3,
  Leaf,
  LoaderCircle,
  Plus,
  RotateCcw,
  Settings2,
  UtensilsCrossed,
} from 'lucide-react'
import { type ReactNode } from 'react'
import type { DiscoveredRecipe } from '~/hooks/use_recipe_discovery'

type DiscoveryRecipeCardProps = {
  recipe: DiscoveredRecipe
  diet: string | null
  isSaving: boolean
  isSkipping: boolean
  onRefine: () => void
  onSkip: () => void
  onSave: () => void
}

export function DiscoveryRecipeCard({
  recipe,
  diet,
  isSaving,
  isSkipping,
  onRefine,
  onSkip,
  onSave,
}: DiscoveryRecipeCardProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-950">
            Découvrez des recettes
          </h1>
          <p className="mt-1 text-base text-stone-500">Selon vos envies et vos critères.</p>
        </div>
        <button
          type="button"
          onClick={onRefine}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
        >
          <Settings2 aria-hidden="true" size={16} /> Modifier les critères
        </button>
      </div>

      <article className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        {recipe.imageDataUrl ? (
          <img
            src={recipe.imageDataUrl}
            alt={`Photo de ${recipe.name}`}
            className="h-64 w-full object-cover sm:h-80"
          />
        ) : (
          <div className="flex h-64 items-center justify-center bg-stone-200 text-sm font-medium text-stone-500 sm:h-80">
            Image indisponible
          </div>
        )}
        <div className="p-5 sm:p-6">
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-stone-950">
            {recipe.name}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <CriteriaChip
              icon={<Clock3 aria-hidden="true" size={16} />}
              label={`${recipe.preparationTime + recipe.cookingTime} min`}
              tone="amber"
            />
            {diet && (
              <CriteriaChip
                icon={<Leaf aria-hidden="true" size={16} />}
                label={diet}
                tone="green"
              />
            )}
            <CriteriaChip
              icon={<UtensilsCrossed aria-hidden="true" size={16} />}
              label="Suggestion IA"
              tone="stone"
            />
          </div>
          <p className="mt-4 text-sm leading-6 text-stone-600">
            {recipe.description || 'Une recette à découvrir.'}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onSkip}
              disabled={isSaving || isSkipping}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 disabled:opacity-50"
            >
              <span className="inline-flex -scale-y-100">
                <RotateCcw
                  aria-hidden="true"
                  size={18}
                  className={isSkipping ? 'animate-spin [animation-direction:reverse]' : undefined}
                />
              </span>{' '}
              Une autre idée
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-700 disabled:opacity-50"
            >
              {isSaving ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus aria-hidden="true" size={18} />
              )}
              {isSaving ? 'Ajout…' : 'Ajouter au carnet'}
            </button>
          </div>
        </div>
      </article>
    </div>
  )
}

function CriteriaChip({
  icon,
  label,
  tone,
}: {
  icon: ReactNode
  label: string
  tone: 'amber' | 'green' | 'stone'
}) {
  const tones = {
    amber: 'bg-amber-100 text-amber-900',
    green: 'bg-emerald-100 text-emerald-900',
    stone: 'bg-stone-100 text-stone-700',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${tones[tone]}`}
    >
      {icon}
      {label}
    </span>
  )
}
