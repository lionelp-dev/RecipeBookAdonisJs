import { Form, Link } from '@adonisjs/inertia/react'
import type { Data } from '@generated/data'

type RecipeFormValues = Pick<
  Data.Recipe,
  'name' | 'description' | 'preparationTime' | 'cookingTime'
>

type RecipeFormAction =
  | {
      route: 'recipes.store'
      resetOnSuccess?: boolean
    }
  | {
      route: 'recipes.update'
      routeParams: { id: number }
    }

type RecipeFormProps = {
  action: RecipeFormAction
  initialValues: RecipeFormValues
  submitLabel: string
  submittingLabel: string
}

type RecipeFormSlotProps = {
  errors: Record<string, string | undefined>
  processing: boolean
}

export function RecipeForm({
  action,
  initialValues,
  submitLabel,
  submittingLabel,
}: RecipeFormProps) {
  const renderFields = ({ errors, processing }: RecipeFormSlotProps) => (
    <>
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-stone-800">
          Nom
        </label>
        <input
          id="name"
          name="name"
          type="text"
          maxLength={255}
          defaultValue={initialValues.name}
          autoComplete="off"
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-invalid={Boolean(errors.name)}
          disabled={processing}
          className="mt-2 min-h-11 w-full rounded-xl border border-stone-300 px-3 py-2 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.name && (
          <p id="name-error" className="mt-2 text-sm text-red-700">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-stone-800">
          Description <span className="font-normal text-stone-500">(facultative)</span>
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={1000}
          rows={5}
          defaultValue={initialValues.description ?? ''}
          aria-describedby={errors.description ? 'description-error' : undefined}
          aria-invalid={Boolean(errors.description)}
          disabled={processing}
          className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.description && (
          <p id="description-error" className="mt-2 text-sm text-red-700">
            {errors.description}
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="preparationTime" className="block text-sm font-semibold text-stone-800">
            Préparation (minutes)
          </label>
          <input
            id="preparationTime"
            name="preparationTime"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            defaultValue={initialValues.preparationTime}
            aria-describedby={errors.preparationTime ? 'preparation-time-error' : undefined}
            aria-invalid={Boolean(errors.preparationTime)}
            disabled={processing}
            className="mt-2 min-h-11 w-full rounded-xl border border-stone-300 px-3 py-2 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.preparationTime && (
            <p id="preparation-time-error" className="mt-2 text-sm text-red-700">
              {errors.preparationTime}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="cookingTime" className="block text-sm font-semibold text-stone-800">
            Cuisson (minutes)
          </label>
          <input
            id="cookingTime"
            name="cookingTime"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            defaultValue={initialValues.cookingTime}
            aria-describedby={errors.cookingTime ? 'cooking-time-error' : undefined}
            aria-invalid={Boolean(errors.cookingTime)}
            disabled={processing}
            className="mt-2 min-h-11 w-full rounded-xl border border-stone-300 px-3 py-2 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {errors.cookingTime && (
            <p id="cooking-time-error" className="mt-2 text-sm text-red-700">
              {errors.cookingTime}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          route="home"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-100"
        >
          Annuler
        </Link>
        <button
          type="submit"
          disabled={processing}
          className="inline-flex min-h-11 w-auto items-center justify-center rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing ? submittingLabel : submitLabel}
        </button>
      </div>
    </>
  )

  const className =
    'mt-8 space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8'

  if (action.route === 'recipes.store') {
    return (
      <Form
        route="recipes.store"
        resetOnSuccess={action.resetOnSuccess}
        className={className}
        noValidate
      >
        {renderFields}
      </Form>
    )
  }

  return (
    <Form route="recipes.update" routeParams={action.routeParams} className={className} noValidate>
      {renderFields}
    </Form>
  )
}
