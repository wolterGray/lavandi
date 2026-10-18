import { useMemo, useState } from "react";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import BookVisitButton from "../../ui/BookVisitButton";
import { useTranslation } from "../../i18n/LanguageProvider";

const ALL_TIMES = ["60", "75", "90", "120"];

const getServicePrice = (service, timeStr, masterTier) => {
  const timeNum = Number(timeStr);
  const tierMap = masterTier === "topMaster" ? service.prices?.topMaster : service.prices?.master;
  if (tierMap && typeof tierMap[timeNum] === "number") {
    return tierMap[timeNum];
  }

  const timeIdx = service.time?.indexOf(timeNum);
  if (timeIdx !== undefined && timeIdx >= 0) {
    if (masterTier === "topMaster" && Array.isArray(service.priceTopMaster)) {
      return service.priceTopMaster[timeIdx] ?? service.price?.[timeIdx];
    }
    return service.price?.[timeIdx];
  }

  return null;
};

function PriceSection({ services = [] }) {
  const { t } = useTranslation();
  const [masterTier, setMasterTier] = useState("master");
  const [selectedTime, setSelectedTime] = useState("60");

  const filtered = useMemo(() => {
    return services
      .map((service) => {
        const price = getServicePrice(service, selectedTime, masterTier);
        if (price === null || price === undefined || price <= 0) return null;
        return {
          ...service,
          activePrice: price,
        };
      })
      .filter(Boolean);
  }, [services, selectedTime, masterTier]);

  return (
    <section id="prices" className="section-padding bg-cream">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle label={t("pricing.label")} description={t("pricing.description")}>
            {t("pricing.title")}
          </SectionTitle>
          <div className="spa-divider" />

          {/* Master / Top Master Toggle */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-pill border border-border/50 bg-card/80 p-1 shadow-spa backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setMasterTier("master")}
                aria-pressed={masterTier === "master"}
                className={[
                  "rounded-pill px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300",
                  masterTier === "master"
                    ? "bg-gold text-void shadow-spa font-extrabold"
                    : "text-stone hover:text-gold",
                ].join(" ")}
              >
                {t("pricing.master")}
              </button>
              <button
                type="button"
                onClick={() => setMasterTier("topMaster")}
                aria-pressed={masterTier === "topMaster"}
                className={[
                  "rounded-pill px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300",
                  masterTier === "topMaster"
                    ? "bg-gold text-void shadow-spa font-extrabold"
                    : "text-stone hover:text-gold",
                ].join(" ")}
              >
                {t("pricing.topMaster")}
              </button>
            </div>
          </div>

          {/* Duration Pills */}
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {ALL_TIMES.map((time) => {
              const active = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  aria-pressed={active}
                  className={[
                    "rounded-pill px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 border",
                    active
                      ? "bg-gold text-void border-gold"
                      : "bg-card text-stone border-border/40 hover:border-gold/40 hover:text-gold",
                  ].join(" ")}
                >
                  {time} {t("common.min")}
                </button>
              );
            })}
          </div>
        </ScrollAnimationWrapper>

        {filtered.length === 0 ? (
          <ScrollAnimationWrapper>
            <p className="text-center text-sm text-muted">{t("pricing.empty")}</p>
          </ScrollAnimationWrapper>
        ) : (
          <div className="card-gradient-border mx-auto max-w-3xl overflow-hidden rounded-card bg-surface shadow-spa">
            <ul className="divide-y divide-spa-brown/10">
              {filtered.map((service, index) => (
                <li key={service.slug}>
                  <ScrollAnimationWrapper
                    delay={index * 0.05}
                    className="flex items-center justify-between gap-6 px-6 py-5 sm:px-8 sm:py-6"
                  >
                    <h3 className="font-display text-lg text-milk sm:text-xl">{service.title}</h3>
                    <div className="shrink-0 text-right">
                      <span className="text-lg font-bold tabular-nums text-gold sm:text-xl">
                        {service.activePrice} {t("common.pln")}
                      </span>
                    </div>
                  </ScrollAnimationWrapper>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ScrollAnimationWrapper delay={0.12} className="mt-10 flex justify-center">
          <BookVisitButton size="lg">{t("services.book")}</BookVisitButton>
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper delay={0.1}>
          <p className="mt-8 text-center text-xs text-muted">{t("pricing.footer")}</p>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}

export default PriceSection;
