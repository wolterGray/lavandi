const btnClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-stone transition duration-300 hover:border-white/15 hover:bg-milk/[0.03] hover:text-milk disabled:opacity-30";

export default function CarouselControls({
  prevRef,
  nextRef,
  onPrev,
  onNext,
  prevLabel = "Previous",
  nextLabel = "Next",
  className = "",
}) {
  const prevProps = onPrev ? { onClick: onPrev } : { ref: prevRef };
  const nextProps = onNext ? { onClick: onNext } : { ref: nextRef };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button type="button" aria-label={prevLabel} className={btnClass} {...prevProps}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button type="button" aria-label={nextLabel} className={btnClass} {...nextProps}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
