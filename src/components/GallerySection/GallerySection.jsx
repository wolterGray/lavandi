import { useCallback, useEffect, useState } from "react";
import Container from "../../ui/Container";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import galleryImages from "../../data/gallery.json";

export default function GallerySection() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(null);

  const closeLightbox = useCallback(() => setActiveIndex(null), []);

  useEffect(() => {
    if (activeIndex === null) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeLightbox();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, closeLightbox]);

  const activeImage = activeIndex !== null ? galleryImages[activeIndex] : null;

  return (
    <>
      <section id="gallery" className="bg-canvas py-14 md:py-16">
        <Container>
          <ScrollAnimationWrapper>
            <div className="mx-auto max-w-3xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                    {t("gallery.label")}
                  </p>
                  <h2 className="mt-2 font-display text-[1.75rem] leading-tight text-milk sm:text-3xl">
                    {t("gallery.title")}
                  </h2>
                </div>
                <p className="max-w-[16rem] text-sm leading-relaxed text-stone">{t("gallery.description")}</p>
              </div>

              <div className="mt-6 overflow-hidden rounded-card border border-border/50 bg-card shadow-spa ring-1 ring-gold/[0.06]">
                <div className="grid h-[17.5rem] grid-cols-3 grid-rows-3 gap-[3px] bg-border/40 p-[3px] sm:h-[21rem] sm:gap-1 sm:p-1 md:h-[23rem]">
                  {galleryImages.map((image, index) => (
                    <button
                      key={image.src}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`group relative overflow-hidden bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold/50 ${index === 0 ? "col-span-2 row-span-2" : ""}`}
                      aria-label={t(`gallery.items.${image.altKey}`)}
                    >
                      <img
                        src={image.src}
                        alt={t(`gallery.items.${image.altKey}`)}
                        loading={index < 3 ? "eager" : "lazy"}
                        className="h-full w-full object-cover transition duration-700 ease-luxury group-hover:scale-[1.05]"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-void/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </Container>
      </section>

      {activeImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-void/92 p-4 backdrop-blur-md sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={t(`gallery.items.${activeImage.altKey}`)}
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-lg text-milk/80 transition hover:border-gold/40 hover:text-gold sm:right-6 sm:top-6"
            aria-label={t("gallery.close")}
          >
            ×
          </button>
          <img
            src={activeImage.src}
            alt={t(`gallery.items.${activeImage.altKey}`)}
            className="max-h-[88vh] max-w-[min(920px,100%)] rounded-card object-contain shadow-spa-hover"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
