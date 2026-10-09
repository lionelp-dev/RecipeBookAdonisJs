import Recipe from '#models/recipe'

export type RecipePage = {
  items: Recipe[]
  totalItems: number
  nextPage: number | null
}

type RecipeCollection = {
  member?: Recipe[]
  totalItems?: number
  view?: { next?: string }
}

export async function getRecipes(page = 1): Promise<RecipePage> {
  const response = await fetch(`/api/recipes?page=${page}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`L'API a répondu avec le statut ${response.status}.`)
  }

  const data = (await response.json()) as RecipeCollection
  const items = Array.isArray(data.member) ? data.member : []
  const nextUrl = data.view?.next

  return {
    items,
    totalItems: data.totalItems ?? 0,
    nextPage: getPageNumber(nextUrl),
  }
}

function getPageNumber(nextUrl: string | undefined): number | null {
  if (!nextUrl) return null

  const page = new URL(nextUrl, window.location.origin).searchParams.get('page')
  const value = Number(page)

  return Number.isInteger(value) && value > 0 ? value : null
}
