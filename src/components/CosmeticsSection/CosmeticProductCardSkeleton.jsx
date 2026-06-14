import { ImageSkeleton } from "../../ui/SiteImage";

export default function CosmeticProductCardSkeleton({ variant = "compact" }) {
  const featured = variant === "featured";

  return (
    <div
      aria-hidden="true"
      className="flex h-full flex-col overflow-hidden rounded-card border border-border/50 bg-card shadow-spa"
    >
      <ImageSkeleton
        className={`w-full shrink-0 ${featured ? "aspect-[4/5]" : "aspect-square"}`}
      />
      <div className={`flex flex-1 flex-col ${featured ? "p-4 sm:p-5" : "p-3 sm:p-3.5"}`}>
        <ImageSkeleton className="h-2 w-1/3 rounded-full" />
        <ImageSkeleton className="mt-2 h-4 w-4/5 rounded-full" />
        <ImageSkeleton className={`rounded-full ${featured ? "mt-3 h-3 w-1/4" : "mt-2 h-2.5 w-1/4"}`} />
        {featured ? <ImageSkeleton className="mt-3 h-8 w-full rounded-md" /> : null}
      </div>
    </div>
  );
}
