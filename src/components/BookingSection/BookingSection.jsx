import SiteImage from "../../ui/SiteImage";
import Container from "../../ui/Container";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useContent } from "../../context/ContentProvider";
import SiteBookingForm from "./SiteBookingForm";
import Button from "../../ui/Button";
import { BOOKSY_URL } from "../../constants/theme";

export default function BookingSection() {
  const { t } = useTranslation();
  const { siteSettings, contact } = useContent();

  const bookingEnabled = siteSettings?.bookingEnabled !== false;

  return (
    <section id="contact" className=" none relative overflow-hidden">
      <SiteImage
        src="/booking/booking.jpg"
        alt=""
        fill
        className="object-cover"
        loading="lazy"
        aria-hidden="true"
      />
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
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
            {bookingEnabled ? t("booking.subtitle") : t("booking.disabledMessage")}
          </p>

          {bookingEnabled ? (
            <SiteBookingForm />
          ) : (
            <div className="mx-auto mt-8 max-w-xl rounded-card border border-white/15 bg-void/55 p-6 text-center backdrop-blur-sm sm:p-8">
              <div className="flex flex-wrap justify-center gap-4">
                {contact?.phone && (
                  <Button href={`tel:${contact.phone}`} variant="primary">
                    {contact.phoneDisplay || contact.phone}
                  </Button>
                )}
                <Button href={contact?.booksyUrl || BOOKSY_URL} variant="secondary">
                  {t("booking.cta")}
                </Button>
              </div>
            </div>
          )}
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}
