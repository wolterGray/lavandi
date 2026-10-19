import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import BookingSection from "../components/BookingSection/BookingSection";
import CallWidget from "../ui/CallWidget";
import ConsentBanner from "../ui/ConsentBanner";
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
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#0d0910] text-[#f7f1f3]">
      <Helmet>
        <html lang={lang === "uk" ? "uk" : lang} />
        <title>Online Booking | Rezerwacja wizyty — NUAR Warszawa</title>
        <meta
          name="description"
          content="Book your massage appointment at NUAR online. Choose your specialist, massage ritual, and convenient time."
        />
        <link rel="canonical" href={`${SITE_URL}/booking`} />
      </Helmet>

      {/* Full-screen edge-to-edge salon background covering entire viewport */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
        <img
          src="/booking/booking.jpg"
          alt=""
          className="h-full w-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-[#0a060b]/75" />
      </div>

      <Header navItems={navItems} linkToHome={true} transparent={true} hideBookButton={true} />

      <main className="booking-page-main relative flex flex-1 flex-col items-center justify-center">
        <BookingSection isStandalone={true} />
      </main>

      <Footer navItems={navItems} linkToHome={true} transparent={true} />
      <CallWidget />
      <ConsentBanner />
    </div>
  );
}
