import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../i18n/LanguageProvider";
import "./BookingCta.css";

export default function BookingCta() {
  const { t } = useTranslation();

  return (
    <section className="booking-cta" aria-labelledby="booking-cta-title">
      <div className="booking-cta__media" aria-hidden="true">
        <img src="/booking/booking.jpg" alt="" loading="lazy" />
      </div>
      <div className="booking-cta__content">
        <p className="booking-cta__label">{t("booking.label")}</p>
        <h2 id="booking-cta-title">{t("booking.title")}</h2>
        <p className="booking-cta__text">{t("booking.subtitle")}</p>
        <Link className="booking-cta__button" to="/booking">
          <span>{t("booking.cta")}</span>
          <ArrowRight aria-hidden="true" size={18} strokeWidth={1.6} />
        </Link>
      </div>
    </section>
  );
}
