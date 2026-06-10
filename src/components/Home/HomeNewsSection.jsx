import { ArrowUpRight } from "lucide-react";
import { useContent } from "../../context/ContentProvider";
import { useTranslation } from "../../i18n/LanguageProvider";

function formatNewsDate(value, lang) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString(lang === "pl" ? "pl-PL" : lang === "uk" ? "uk-UA" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export default function HomeNewsSection() {
  const { lang, t } = useTranslation();
  const { getHomeNews } = useContent();

  const fallback = {
    sectionLabel: t("homeNews.sectionLabel"),
    items: t("homeNews.items") ?? [],
  };
  const { sectionLabel, items } = getHomeNews(lang, fallback);

  if (!items.length) return null;

  return (
    <section
      id="news"
      aria-labelledby="home-news-title"
      className="border-b border-border/30 bg-cream px-5 py-10 sm:px-8 lg:py-12"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">NUAR</p>
            <h2 id="home-news-title" className="mt-2 font-display text-2xl text-ink md:text-3xl">
              {sectionLabel}
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const dateLabel = formatNewsDate(item.date, lang);
            const card = (
              <article
                key={item.id}
                className="group flex h-full flex-col rounded-card border border-border/40 bg-white/70 p-5 shadow-spa transition hover:border-gold/35 hover:shadow-spa-hover"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  {dateLabel && (
                    <time className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      {dateLabel}
                    </time>
                  )}
                  {item.link && (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/50 text-ink-muted transition group-hover:border-gold/40 group-hover:text-gold">
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xl text-ink">{item.title}</h3>
                {item.body && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{item.body}</p>
                )}
                {item.link && item.linkLabel && (
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-gold">
                    {item.linkLabel}
                  </p>
                )}
              </article>
            );

            if (item.link) {
              return (
                <a
                  key={item.id}
                  href={item.link}
                  target={item.link.startsWith("http") ? "_blank" : undefined}
                  rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                >
                  {card}
                </a>
              );
            }

            return card;
          })}
        </div>
      </div>
    </section>
  );
}
