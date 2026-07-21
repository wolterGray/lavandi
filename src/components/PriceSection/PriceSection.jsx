import { useMemo, useState } from "react";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import BookVisitButton from "../../ui/BookVisitButton";
import { useTranslation } from "../../i18n/LanguageProvider";

const times = ["30", "60", "75", "90", "120"];

function PriceSection({ services = [] }) {
  const { t } = useTranslation();
  const [selectedTime, setSelectedTime] = useState("60");

  const filtered = useMemo(
    () => services.filter((s) => s.time?.includes(+selectedTime)),
    [services, selectedTime]
  );

  const getDiscountedPrice = (price, discount = 0) => {
    if (!price || !discount) return price;
    return Math.round(price * (1 - discount / 100));
  };

  return (
    <section id="prices" className="section-padding bg-cream">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle label={t("pricing.label")} description={t("pricing.description")}>{t("pricing.title")}</SectionTitle>
          <div className="spa-divider" />

          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {times.map((time) => {
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
                      ? "bg-[#c89f65] text-[#08060c] border-[#c89f65]"
                      : "bg-[#100e14] text-stone border-border/40 hover:border-[#c89f65]/40 hover:text-[#c89f65]",
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
              {filtered.map((service, index) => {
                const timeIdx = service.time.indexOf(+selectedTime);
                const price = service.price?.[timeIdx];
                const discount = service.discount ?? 0;
                const finalPrice = getDiscountedPrice(price, discount);
                return (
                  <li key={service.slug}>
                    <ScrollAnimationWrapper delay={index * 0.06} className="flex items-center justify-between gap-6 px-6 py-5 sm:px-8 sm:py-6">
                      <h3 className="font-display text-lg text-milk sm:text-xl">{service.title}</h3>
                      <div className="shrink-0 text-right">
                        {discount > 0 && <span className="block text-xs text-muted line-through">{price} {t("common.pln")}</span>}
                        <span className="text-lg font-bold tabular-nums text-gold sm:text-xl">{finalPrice} {t("common.pln")}</span>
                      </div>
                    </ScrollAnimationWrapper>
                  </li>
                );
              })}
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
