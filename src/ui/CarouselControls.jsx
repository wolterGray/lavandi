export function CarouselControls({ onPrev, onNext, prevLabel, nextLabel, className = "" }) {
  const btnClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-stone transition hover:border-gold/30 hover:text-milk";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button type="button" onClick={onPrev} aria-label={prevLabel} className={btnClass}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button type="button" onClick={onNext} aria-label={nextLabel} className={btnClass}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
