import { Form, Link } from '@adonisjs/inertia/react'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

type RecipeIngredientInput = {
  name: string
  quantity: number
  unit: string | null
}

type RecipeFormValues = {
  name: string
  description: string | null
  preparationTime: number
  cookingTime: number
  ingredients: RecipeIngredientInput[]
}

type IngredientFormState = RecipeIngredientInput & { key: string }

type RecipeFormAction =
  | { route: 'recipes.store'; resetOnSuccess?: boolean }
  | { route: 'recipes.update'; routeParams: { id: number } }

type RecipeFormProps = {
  action: RecipeFormAction
  initialValues: RecipeFormValues
  submitLabel: string
  submittingLabel: string
}

export function RecipeForm({
  action,
  initialValues,
  submitLabel,
  submittingLabel,
}: RecipeFormProps) {
  const [ingredients, setIngredients] = useState<IngredientFormState[]>(() =>
    initialValues.ingredients.map((ingredient, index) => ({
      ...ingredient,
      key: `${ingredient.name}-${index}`,
    }))
  )

  function updateIngredient(index: number, field: keyof RecipeIngredientInput, value: string) {
    setIngredients((current) =>
      current.map((ingredient, ingredientIndex) => {
        if (ingredientIndex !== index) return ingredient
        if (field === 'quantity') return { ...ingredient, quantity: Number(value) }
        if (field === 'unit') return { ...ingredient, unit: value || null }
        return { ...ingredient, name: value }
      })
    )
  }

  function addIngredient() {
    setIngredients((current) => [
      ...current,
      { key: crypto.randomUUID(), name: '', quantity: 1, unit: null },
    ])
  }

  function removeIngredient(index: number) {
    setIngredients((current) => current.filter((_, ingredientIndex) => ingredientIndex !== index))
  }

  const renderFields = ({
    errors,
    processing,
  }: {
    errors: Record<string, string | undefined>
    processing: boolean
  }) => (
    <>
      <section
        className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7"
        aria-labelledby="general-information-title"
      >
        <h2 id="general-information-title" className="text-base font-bold text-stone-900">
          Informations générales
        </h2>
        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700">
              Nom de la recette
            </label>
            <input
              id="name"
              name="name"
              type="text"
              maxLength={100}
              placeholder="Entrez le nom de la recette"
              defaultValue={initialValues.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              aria-invalid={Boolean(errors.name)}
              disabled={processing}
              className="mt-2 min-h-10 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-200 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.name && (
              <p id="name-error" className="mt-2 text-sm text-red-700">
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-stone-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              maxLength={1000}
              rows={5}
              placeholder="Décrivez votre recette"
              defaultValue={initialValues.description ?? ''}
              aria-describedby={errors.description ? 'description-error' : undefined}
              aria-invalid={Boolean(errors.description)}
              disabled={processing}
              className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-200 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.description && (
              <p id="description-error" className="mt-2 text-sm text-red-700">
                {errors.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <section
        className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7"
        aria-labelledby="recipe-details-title"
      >
        <h2 id="recipe-details-title" className="text-base font-bold text-stone-900">
          Détails de la recette
        </h2>
        <div className="mt-6 grid gap-5 sm:max-w-xl sm:grid-cols-2">
          <DurationField
            id="preparationTime"
            label="Préparation (minutes)"
            defaultValue={initialValues.preparationTime}
            error={errors.preparationTime}
            disabled={processing}
          />
          <DurationField
            id="cookingTime"
            label="Cuisson (minutes)"
            defaultValue={initialValues.cookingTime}
            error={errors.cookingTime}
            disabled={processing}
          />
        </div>
      </section>

      <section
        className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-7"
        aria-labelledby="ingredients-title"
      >
        <h2 id="ingredients-title" className="text-base font-bold text-stone-900">
          Ingrédients
        </h2>
        {ingredients.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-stone-300 px-4 py-5 text-sm text-stone-500">
            Aucun ingrédient pour le moment.
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {ingredients.map((ingredient, index) => (
              <div key={ingredient.key} className="rounded-lg bg-stone-50/50">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_6rem_8rem_auto] md:items-end">
                  <IngredientField
                    id={`ingredient-name-${ingredient.key}`}
                    label="Nom"
                    placeholder="Nom de l’ingrédient"
                    value={ingredient.name}
                    error={errors[`ingredients.${index}.name`]}
                    disabled={processing}
                    onChange={(value) => updateIngredient(index, 'name', value)}
                  />
                  <IngredientField
                    id={`ingredient-quantity-${ingredient.key}`}
                    label="Quantité"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={String(ingredient.quantity)}
                    error={errors[`ingredients.${index}.quantity`]}
                    disabled={processing}
                    onChange={(value) => updateIngredient(index, 'quantity', value)}
                  />
                  <IngredientField
                    id={`ingredient-unit-${ingredient.key}`}
                    label="Unité"
                    placeholder="Unité"
                    maxLength={50}
                    value={ingredient.unit ?? ''}
                    error={errors[`ingredients.${index}.unit`]}
                    disabled={processing}
                    onChange={(value) => updateIngredient(index, 'unit', value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    disabled={processing}
                    aria-label={`Supprimer l’ingrédient ${index + 1}`}
                    className="inline-flex size-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 aria-hidden="true" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={addIngredient}
          disabled={processing}
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus aria-hidden="true" size={16} />
          Ajouter un ingrédient
        </button>
      </section>

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={processing}
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing ? submittingLabel : submitLabel}
        </button>
        <Link
          href="/"
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
        >
          Annuler
        </Link>
      </div>
    </>
  )

  const transform = (data: Record<string, unknown>) => ({
    ...data,
    ingredients: ingredients.map(({ key: _, ...ingredient }) => ingredient),
  })
  const className = 'flex w-full flex-col gap-5 pb-8 pt-4'

  if (action.route === 'recipes.store') {
    return (
      <Form
        route="recipes.store"
        resetOnSuccess={action.resetOnSuccess}
        className={className}
        transform={transform}
        noValidate
      >
        {renderFields}
      </Form>
    )
  }

  return (
    <Form
      route="recipes.update"
      routeParams={action.routeParams}
      className={className}
      transform={transform}
      noValidate
    >
      {renderFields}
    </Form>
  )
}

function DurationField({
  id,
  label,
  defaultValue,
  error,
  disabled,
}: {
  id: 'preparationTime' | 'cookingTime'
  label: string
  defaultValue: number
  error?: string
  disabled: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="number"
        min="0"
        step="1"
        defaultValue={defaultValue}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        className="mt-2 min-h-10 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

function IngredientField({
  id,
  label,
  type = 'text',
  placeholder,
  min,
  step,
  maxLength,
  value,
  error,
  disabled,
  onChange,
}: {
  id: string
  label: string
  type?: 'text' | 'number'
  placeholder?: string
  min?: string
  step?: string
  maxLength?: number
  value: string
  error?: string
  disabled: boolean
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        min={min}
        step={step}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        className="mt-2 min-h-10 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-200 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
