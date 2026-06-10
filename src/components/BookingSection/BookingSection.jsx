import Container from "../../ui/Container";
import Button from "../../ui/Button";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import { BOOKSY_URL } from "../../constants/theme";

export default function BookingSection() {
  const { t } = useTranslation();

  return (
    <section id="contact" className="relative overflow-hidden">
      <img src="/booking/booking.jpg" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[rgba(154,132,88,0.06)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-void/80 via-void/75 to-void/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(8,6,12,0.45)_100%)]" />

      <Container className="relative section-padding text-center">
        <ScrollAnimationWrapper>
          <p className="section-label text-gold">{t("booking.label")}</p>
          <div className="spa-divider" />
          <h2 className="section-heading mx-auto mt-6 max-w-2xl text-white sm:text-display-md">
            {t("booking.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">{t("booking.subtitle")}</p>
          <div className="mt-8 flex justify-center">
            <Button href={BOOKSY_URL} size="lg">{t("booking.cta")}</Button>
          </div>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}
