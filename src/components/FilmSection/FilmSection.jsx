import { useState } from "react";
import Container from "../../ui/Container";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";

export default function FilmSection() {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);

  return (
    <section className="bg-void text-milk">
      <Container className="section-padding">
        <ScrollAnimationWrapper>
          <div className="text-center">
            <p className="section-label text-stone">{t("film.label")}</p>
            <h2 className="section-heading mt-4">
              {t("film.title")}
            </h2>
          </div>
        </ScrollAnimationWrapper>

        <ScrollAnimationWrapper delay={0.1}>
          <div className="relative mx-auto mt-12 max-w-5xl overflow-hidden">
          {!playing ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group relative block w-full"
              aria-label={t("film.play")}
            >
              <img
                src="/massage/2.webp"
                alt=""
                className="aspect-video w-full object-cover opacity-90 transition group-hover:opacity-100"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-void/20 transition group-hover:bg-void/10">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-milk/30 bg-void/20 backdrop-blur-sm transition group-hover:scale-105">
                  <svg className="ml-1 h-6 w-6 text-milk" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            </button>
          ) : (
            <div className="aspect-video w-full bg-void">
              <img
                src="/massage/2.webp"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <p className="mt-6 text-center text-sm text-stone">{t("film.caption")}</p>
        </div>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}
