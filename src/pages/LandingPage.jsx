import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "../i18n/LanguageProvider";
import Header from "../components/Header/Header";
import Home from "../components/Home/Home";
import AboutSection from "../components/AboutSection/AboutSection";
import StatsSection from "../components/StatsSection/StatsSection";
import SignatureRituals from "../components/SignatureRituals/SignatureRituals";
import MassageServices from "../components/MassageServices/MassageServices";
import TeamSections from "../components/TeamSections/TeamSections";
import ReviewsSection from "../components/ReviewsSection/ReviewsSection";
import PriceSection from "../components/PriceSection/PriceSection";
import LocationSection from "../components/LocationSection/LocationSection";
import FaqSection from "../components/FaqSection/FaqSection";
import BookingSection from "../components/BookingSection/BookingSection";
import Footer from "../components/Footer/Footer";
import HelmetSEO from "../components/HelmetSEO";
import CallWidget from "../ui/CallWidget";
import ConsentBanner from "../ui/ConsentBanner";
import StickyCta from "../ui/StickyCta";
import reviews from "../data/reviews.json";

export default function LandingPage() {
  const location = useLocation();
  const { t, localizedServices } = useTranslation();

  const navItems = [
    { label: t("nav.rituals"), path: "signature" },
    { label: t("nav.about"), path: "about" },
    { label: t("nav.reviews"), path: "opinie" },
    { label: t("nav.contact"), path: "contact" },
  ];

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);

  return (
    <>
      <HelmetSEO reviewCount={reviews.length} />
      <Header navItems={navItems} />
      <Home />
      <AboutSection />
      <StatsSection />
      <SignatureRituals services={localizedServices} />
      <MassageServices services={localizedServices} />
      <TeamSections />
      <ReviewsSection reviews={reviews} />
      <PriceSection services={localizedServices} />
      <LocationSection />
      <FaqSection />
      <BookingSection />
      <Footer navItems={navItems} />
      <CallWidget />
      <StickyCta />
      <ConsentBanner />
    </>
  );
}
