import { useEffect, useRef } from 'react'

type UseLoadMoreOnIntersectOptions = {
  hasNextPage: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
}

export function useLoadMoreOnIntersect({
  hasNextPage,
  isLoadingMore,
  onLoadMore,
}: UseLoadMoreOnIntersectOptions) {
  const targetRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target || !hasNextPage || isLoadingMore) return

    const scrollContainer = target.closest<HTMLElement>('[data-scroll-container]')
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore()
      },
      { root: scrollContainer, rootMargin: '160px' }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasNextPage, isLoadingMore, onLoadMore])

  return targetRef
}
