import { useMemo, useState } from "react";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
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
    <section id="prices" className="section-padding border-t border-white/[0.06]">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle label={t("pricing.label")} description={t("pricing.description")}>{t("pricing.title")}</SectionTitle>
          <div className="mb-10 flex flex-wrap gap-6 border-b border-white/[0.06]">
            {times.map((time) => {
              const active = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  aria-pressed={active}
                  className={[
                    "pb-3 text-xs uppercase tracking-[0.18em] transition",
                    active ? "border-b border-gold text-milk" : "border-b border-transparent text-muted hover:text-stone",
                  ].join(" ")}
                >
                  {time} {t("common.min")}
                </button>
              );
            })}
          </div>
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted">{t("pricing.empty")}</p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {filtered.map((service) => {
                const timeIdx = service.time.indexOf(+selectedTime);
                const price = service.price?.[timeIdx];
                const discount = service.discount ?? 0;
                const finalPrice = getDiscountedPrice(price, discount);
                return (
                  <li key={service.slug} className="flex items-center justify-between gap-6 py-5 sm:py-6">
                    <h3 className="font-display text-lg text-milk sm:text-xl">{service.title}</h3>
                    <div className="shrink-0 text-right">
                      {discount > 0 && <span className="block text-xs text-muted line-through">{price} {t("common.pln")}</span>}
                      <span className="text-lg tabular-nums text-champagne sm:text-xl">{finalPrice} {t("common.pln")}</span>
                      {discount > 0 && <span className="ml-2 text-[10px] uppercase tracking-wider text-gold">{t("pricing.discount", { percent: discount })}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-10 text-center text-xs text-muted">{t("pricing.footer")}</p>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}

export default PriceSection;
