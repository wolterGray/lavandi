import Container from "../../ui/Container";
import Button from "../../ui/Button";
import { useTranslation } from "../../i18n/LanguageProvider";
import { BOOKSY_URL } from "../../constants/theme";

export default function BookingSection() {
  const { t } = useTranslation();

  return (
    <section id="contact" className="section-padding">
      <Container>
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]">
          <img
            src="/booking/booking.jpg"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-void/75" />

          <div className="relative px-6 py-16 text-center sm:px-10 sm:py-20 md:py-24">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold">{t("booking.label")}</p>
            <h2 className="mx-auto mt-4 max-w-xl font-display text-display-sm text-milk text-balance sm:text-display-md">
              {t("booking.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-stone sm:text-base">{t("booking.subtitle")}</p>
            <div className="mt-8 flex justify-center">
              <Button href={BOOKSY_URL} size="lg">
                {t("booking.cta")}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
