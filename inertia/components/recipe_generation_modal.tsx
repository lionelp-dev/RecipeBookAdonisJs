import { router } from '@inertiajs/react'
import { Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import type { RecipesPageProps } from '~/hooks/use_recipes'

const presets = ['Rapide et facile', 'Végétarienne', 'Équilibrée', 'Cuisine du monde']

type RecipeGenerationModalProps = {
  onGenerationStatusChange: (isGenerating: boolean) => void
  onRecipesUpdated: (page: RecipesPageProps) => void
}

export function RecipeGenerationModal({
  onGenerationStatusChange,
  onRecipesUpdated,
}: RecipeGenerationModalProps) {
  const [open, setOpen] = useState(false)
  const [multiple, setMultiple] = useState(false)
  const [count, setCount] = useState(3)
  const [prompt, setPrompt] = useState('')
  const [generateImages, setGenerateImages] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function submit() {
    setError(null)
    router.post(
      '/recipes/generate',
      { prompt, count: multiple ? count : 1, generateImages },
      {
        async: true,
        preserveScroll: true,
        onStart: () => {
          setProcessing(true)
          onGenerationStatusChange(true)
          setOpen(false)
          setPrompt('')
        },
        onError: (errors: Record<string, string>) => {
          const message = Object.values(errors)[0]
          setError(typeof message === 'string' ? message : 'La génération a échoué. Réessayez.')
          setOpen(true)
        },
        onFinish: () => {
          setProcessing(false)
          onGenerationStatusChange(false)
        },
        onSuccess: (page) => onRecipesUpdated(page.props as unknown as RecipesPageProps),
      }
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={processing}
        className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
      >
        {processing ? (
          <span className="size-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-700" />
        ) : (
          <Sparkles aria-hidden="true" size={16} />
        )}
        {processing ? 'Génération en cours…' : 'Générer avec l’IA'}
      </button>
      {open && (
        <div
          className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-xl rounded-2xl bg-white p-6 shadow-xl ring-1 ring-stone-200 sm:p-7"
          role="dialog"
          aria-labelledby="ai-generation-title"
        >
          <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="ai-generation-title"
                  className="flex items-center gap-2 text-xl font-bold text-stone-900"
                >
                  <Sparkles size={20} /> Générer des recettes
                </h2>
                <p className="mt-2 text-sm leading-5 text-stone-500">
                  Décrivez votre envie : les recettes seront ajoutées directement au carnet.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="rounded-lg p-1 text-stone-500 hover:bg-stone-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 rounded-lg border border-stone-200 p-1">
              <button
                type="button"
                disabled={processing}
                onClick={() => setMultiple(false)}
                className={`rounded-md px-3 py-2 text-sm font-semibold ${!multiple ? 'bg-stone-900 text-white' : 'text-stone-600'}`}
              >
                Une recette
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => setMultiple(true)}
                className={`rounded-md px-3 py-2 text-sm font-semibold ${multiple ? 'bg-stone-900 text-white' : 'text-stone-600'}`}
              >
                Plusieurs recettes
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium text-stone-700" htmlFor="ai-prompt">
              Votre idée
            </label>
            <textarea
              id="ai-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              disabled={processing}
              rows={5}
              maxLength={5000}
              placeholder="Ex. un plat végétarien avec des courgettes et du fromage frais"
              className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-200 disabled:opacity-50"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={processing}
                  onClick={() =>
                    setPrompt((value) => (value ? `${value}, ${preset.toLowerCase()}` : preset))
                  }
                  className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  {preset}
                </button>
              ))}
            </div>

            {multiple && (
              <div className="mt-5">
                <label htmlFor="ai-count" className="block text-sm font-medium text-stone-700">
                  Nombre de recettes
                </label>
                <select
                  id="ai-count"
                  value={count}
                  onChange={(event) => setCount(Number(event.target.value))}
                  disabled={processing}
                  className="mt-2 min-h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm"
                >
                  {[2, 3, 4, 5, 6, 8, 10].map((value) => (
                    <option key={value} value={value}>
                      {value} recettes
                    </option>
                  ))}
                </select>
              </div>
            )}
            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-lg border border-stone-200 p-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={generateImages}
                onChange={(event) => setGenerateImages(event.target.checked)}
                disabled={processing}
                className="size-4"
              />{' '}
              Générer une image pour chaque recette
            </label>
            {error && (
              <p role="alert" className="mt-4 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              type="button"
              disabled={processing || prompt.trim().length < 3}
              onClick={submit}
              className="mt-6 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing && (
                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {processing ? 'Génération en cours…' : 'Générer les recettes'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
