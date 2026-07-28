import { Form, Link } from '@adonisjs/inertia/react'
import type { Data } from '@generated/data'
import { router } from '@inertiajs/react'
import { Pencil, Trash2 } from 'lucide-react'
import type { InertiaProps } from '~/types'

export default function Home({ recipes }: InertiaProps<{ recipes: Data.Recipe[] }>) {
  const recipeCount = recipes.length

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-stone-50 text-stone-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <section aria-labelledby="recipes-title">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-amber-700">
                Carnet de cuisine
              </p>
              <h1 id="recipes-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
                Mes recettes
              </h1>
              <p className="mt-2 text-sm text-stone-500" aria-live="polite">
                {recipeCount} recette{recipeCount === 1 ? '' : 's'}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.reload({ only: ['recipes'] })}
                className="inline-flex min-h-11 w-auto items-center justify-center rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-stone-400 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
              >
                Actualiser
              </button>
              <Link
                route="recipes.create"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
              >
                Nouvelle recette
              </Link>
            </div>
          </div>

          {recipes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
              <h2 className="text-lg font-bold">Aucune recette pour le moment</h2>
              <p className="mt-2 text-sm text-stone-500">
                Les recettes ajoutées à votre carnet apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {recipes.map((recipe) => (
                <article
                  key={recipe.id}
                  className="flex min-h-52 flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <h2 className="text-xl font-bold tracking-tight">{recipe.name}</h2>

                  <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-600">
                    <div className="flex gap-1.5">
                      <dt className="font-semibold text-stone-800">Préparation :</dt>
                      <dd>{recipe.preparationTime} min</dd>
                    </div>
                    <div className="flex gap-1.5">
                      <dt className="font-semibold text-stone-800">Cuisson :</dt>
                      <dd>{recipe.cookingTime} min</dd>
                    </div>
                  </dl>

                  <p className="mt-4 line-clamp-4 text-sm leading-6 text-stone-600">
                    {recipe.description || 'Aucune description disponible.'}
                  </p>

                  <div className="mt-auto flex gap-3 pt-6">
                    <Link
                      route="recipes.edit"
                      routeParams={{ id: recipe.id }}
                      aria-label={`Modifier la recette ${recipe.name}`}
                      className="inline-flex size-11 items-center justify-center rounded-xl border border-stone-300 bg-white text-stone-800 transition hover:border-stone-400 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
                    >
                      <Pencil aria-hidden="true" size={18} />
                    </Link>
                    <Form
                      route="recipes.destroy"
                      routeParams={{ id: recipe.id }}
                      onBefore={() => window.confirm(`Supprimer la recette « ${recipe.name} » ?`)}
                      className="contents"
                    >
                      {({ processing }) => (
                        <button
                          type="submit"
                          disabled={processing}
                          aria-label={
                            processing
                              ? `Suppression de la recette ${recipe.name}`
                              : `Supprimer la recette ${recipe.name}`
                          }
                          className="inline-flex size-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-800 transition hover:border-red-300 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 aria-hidden="true" size={18} />
                        </button>
                      )}
                    </Form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
