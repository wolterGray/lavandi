import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "../i18n/LanguageProvider";
import Header from "../components/Header/Header";
import Home from "../components/Home/Home";
import AboutSection from "../components/AboutSection/AboutSection";
import TrustSection from "../components/TrustSection/TrustSection";
import StatsSection from "../components/StatsSection/StatsSection";
import MassageServices from "../components/MassageServices/MassageServices";
import TeamSections from "../components/TeamSections/TeamSections";
import ReviewsSection from "../components/ReviewsSection/ReviewsSection";
import GallerySection from "../components/GallerySection/GallerySection";
import PriceSection from "../components/PriceSection/PriceSection";
import LocationSection from "../components/LocationSection/LocationSection";
import FaqSection from "../components/FaqSection/FaqSection";
import BookingSection from "../components/BookingSection/BookingSection";
import CosmeticsSection from "../components/CosmeticsSection/CosmeticsSection";
import { COSMETICS_ROUTE } from "../components/CosmeticsSection/cosmeticsShared";
import Footer from "../components/Footer/Footer";
import HelmetSEO from "../components/HelmetSEO";
import CallWidget from "../ui/CallWidget";
import ConsentBanner from "../ui/ConsentBanner";
import StickyCta from "../ui/StickyCta";

export default function LandingPage() {
  const location = useLocation();
  const { t, localizedServices } = useTranslation();

  const navItems = [
    { label: t("nav.home"), path: "home" },
    { label: t("nav.services"), path: "services" },
    { label: t("nav.price"), path: "prices" },
    { label: t("nav.cosmetics"), to: COSMETICS_ROUTE },
    { label: t("nav.about"), path: "about" },
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
      <HelmetSEO />
      <Header navItems={navItems} />
      <Home />
      <MassageServices services={localizedServices} />
      <PriceSection services={localizedServices} />
      <CosmeticsSection />
      <AboutSection />
      <TrustSection />
      <StatsSection />
      <TeamSections />
      <ReviewsSection />
      <GallerySection />
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
