import { Link } from '@adonisjs/inertia/react'
import { Plus } from 'lucide-react'

type AppHeaderProps = {
  currentPage: string
}

export function AppHeader({ currentPage }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <nav aria-label="Fil d’Ariane" className="min-w-0 text-sm">
          <ol className="flex flex-wrap items-center gap-2 text-stone-500">
            <li>
              <Link
                href="/"
                className="font-semibold transition hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-900"
              >
                Carnet de recettes
              </Link>
            </li>
            <li aria-hidden="true" className="text-stone-400">
              ›
            </li>
            <li aria-current="page" className="font-semibold text-stone-900">
              {currentPage}
            </li>
          </ol>
        </nav>

        <Link
          route="recipes.create"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-stone-900 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 sm:px-4"
        >
          <Plus aria-hidden="true" size={16} />
          Nouvelle recette
        </Link>
      </div>
    </header>
  )
}
