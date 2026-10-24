import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import BookingSection from "../components/BookingSection/BookingSection";
import CallWidget from "../ui/CallWidget";
import ConsentBanner from "../ui/ConsentBanner";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import LogoNuar from "../ui/LogoNuar";
import { useTranslation } from "../i18n/LanguageProvider";
import { COSMETICS_ROUTE } from "../components/CosmeticsSection/cosmeticsShared";
import { SITE_URL } from "../constants/theme";

export default function BookingPage() {
  const { t, lang } = useTranslation();

  const navItems = [
    { label: t("nav.home"), path: "home" },
    { label: t("nav.services"), path: "services" },
    { label: t("nav.price"), path: "prices" },
    { label: t("nav.cosmetics"), to: COSMETICS_ROUTE },
    { label: t("nav.about"), path: "about" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="booking-page relative flex min-h-screen flex-col overflow-x-hidden text-[#f7f1f3]">
      <Helmet>
        <html lang={lang === "uk" ? "uk" : lang} />
        <title>Online Booking | Rezerwacja wizyty — NUAR Warszawa</title>
        <meta
          name="description"
          content="Book your massage appointment at NUAR online. Choose your specialist, massage ritual, and convenient time."
        />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={`${SITE_URL}/booking`} />
      </Helmet>

      <div className="booking-desktop-header">
        <Header
          bookingLanguageMode={true}
          hideBookButton={true}
          linkToHome={true}
          navItems={navItems}
          transparent={true}
        />
      </div>

      <header className="booking-mobile-header">
        <Link to="/" aria-label={t("nav.home")}>
          <LogoNuar />
        </Link>
        <span>{t("nav.book")}</span>
        <LanguageSwitcher bookingMode={true} />
      </header>

      <main className="booking-page-main relative flex flex-1 flex-col items-center justify-center">
        <BookingSection isStandalone={true} />
      </main>

      <div className="booking-desktop-footer">
        <Footer navItems={navItems} linkToHome={true} transparent={true} />
        <CallWidget />
      </div>
      <ConsentBanner />
    </div>
  );
}
