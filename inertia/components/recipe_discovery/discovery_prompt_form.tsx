import { ChefHat, Clock3, Info, Leaf, Sparkles } from 'lucide-react'
import { type FormEvent, type ReactNode } from 'react'

type DiscoveryPromptFormProps = {
  prompt: string
  maxDuration: string | null
  diet: string | null
  style: string | null
  isRefining: boolean
  showForm: boolean
  onPromptChange: (prompt: string) => void
  onDurationSelect: (option: string) => void
  onDietSelect: (option: string) => void
  onStyleSelect: (option: string) => void
  onSubmit: () => void
}

const durationOptions = ['15 min', '30 min', '1 h', 'Peu importe']
const dietOptions = ['Végétarien', 'Végan', 'Sans gluten', 'Sans produits laitiers']
const styleOptions = [
  'Équilibré',
  'Cuisine du monde',
  'Repas familial',
  'Plats réconfortants',
  'Recettes légères',
]

export function DiscoveryPromptForm({
  prompt,
  maxDuration,
  diet,
  style,
  isRefining,
  showForm,
  onPromptChange,
  onDurationSelect,
  onDietSelect,
  onStyleSelect,
  onSubmit,
}: DiscoveryPromptFormProps) {
  return (
    <>
      <div>
        <div className="flex items-end gap-4">
          <span className="rounded-2xl bg-amber-100 p-3 text-amber-800 shadow-sm">
            <Sparkles aria-hidden="true" size={24} />
          </span>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-950">
            Découvrir des recettes avec l’IA
          </h1>
        </div>
        <p className="mt-3 text-base leading-6 text-stone-500">
          Explorer de nouvelles idées et ajoutez celles que vous aimez.
        </p>
      </div>

      {showForm && (
        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            onSubmit()
          }}
          className="mt-8"
        >
          <label htmlFor="discovery-prompt" className="text-base font-semibold text-stone-900">
            Qu’avez-vous envie de manger ?
          </label>
          <textarea
            id="discovery-prompt"
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            rows={5}
            maxLength={5000}
            placeholder="Ex. un dîner végétarien gourmand, des recettes avec des légumes de saison, ou un plat rapide pour la semaine…"
            className="mt-2 w-full resize-none rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm leading-6 text-stone-800 outline-none placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-200"
          />
          <PreferenceGroup
            icon={<Clock3 aria-hidden="true" size={18} />}
            label="Durée maximale"
            options={durationOptions}
            selectedOption={maxDuration}
            onSelect={onDurationSelect}
            className="mt-7 border-b border-stone-200 pb-5"
          />
          <PreferenceGroup
            icon={<Leaf aria-hidden="true" size={18} />}
            label="Alimentation"
            options={dietOptions}
            selectedOption={diet}
            onSelect={onDietSelect}
            className="border-b border-stone-200 py-5"
          />
          <PreferenceGroup
            icon={<ChefHat aria-hidden="true" size={18} />}
            label="Style"
            options={styleOptions}
            selectedOption={style}
            onSelect={onStyleSelect}
            className="py-5"
          />

          <button
            type="submit"
            disabled={prompt.trim().length < 3}
            className="mt-2 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles aria-hidden="true" size={20} />{' '}
            {isRefining ? 'Mettre à jour les suggestions' : 'Générer des idées'}
          </button>
          <p className="mt-4 flex items-center justify-center gap-2 text-sm text-stone-500">
            <Info aria-hidden="true" size={16} /> Aucune recette ne sera ajoutée automatiquement.
          </p>
        </form>
      )}
    </>
  )
}

function PreferenceGroup({
  icon,
  label,
  options,
  selectedOption,
  onSelect,
  className,
}: {
  icon: ReactNode
  label: string
  options: string[]
  selectedOption: string | null
  onSelect: (option: string) => void
  className: string
}) {
  return (
    <div className={className}>
      <p className="flex items-center gap-2 text-base font-semibold text-stone-900">
        {icon} {label} <span className="font-normal text-stone-500">(facultatif)</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <PreferenceButton
            key={option}
            active={selectedOption === option}
            onClick={() => onSelect(option)}
          >
            {option}
          </PreferenceButton>
        ))}
      </div>
    </div>
  )
}

function PreferenceButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? 'border-amber-400 bg-amber-100 text-stone-900 shadow-sm'
          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50'
      }`}
    >
      {children}
    </button>
  )
}
