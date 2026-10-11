import { Sparkles } from 'lucide-react'

export function DiscoveryPausedBanner({ onResume }: { onResume: () => void }) {
  return (
    <div className="discovery-paused-banner shrink-0">
      <button
        type="button"
        onClick={onResume}
        className="block w-full cursor-pointer border-b border-stone-200 bg-stone-100 px-6 py-4 text-left transition hover:bg-stone-200 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-stone-900 sm:px-10"
        aria-label="Reprendre la découverte"
      >
        <div className="discovery-paused-banner-content flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <Sparkles aria-hidden="true" size={22} className="mt-0.5 shrink-0 text-amber-800" />
            <div>
              <p className="font-semibold text-stone-900">Mode découverte en pause</p>
              <p className="mt-1 text-sm text-stone-500">
                Votre suggestion et vos critères sont conservés pendant que vous consultez cette
                recette.
              </p>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-4 text-sm font-semibold underline underline-offset-2">
            Reprendre la découverte
          </span>
        </div>
      </button>
    </div>
  )
}
