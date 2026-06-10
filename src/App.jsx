import { useEffect, useState } from "react";
import { Routes, Route, useParams, Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "./i18n/LanguageProvider";
import LandingPage from "./pages/LandingPage";
import ServicePage from "./pages/ServicePage";
import CosmeticsPage from "./pages/CosmeticsPage";
import NotFoundPage from "./pages/NotFoundPage";
import SplashScreen from "./ui/SplashScreen";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function ServiceRoute() {
  const { slug } = useParams();
  const { localizedServices } = useTranslation();
  const service = localizedServices.find((s) => s.slug === slug);
  if (!service) return <NotFoundPage />;
  return <ServicePage service={service} />;
}

export default function App() {
  const { t } = useTranslation();
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      <SplashScreen onDone={() => setSplashDone(true)} />

      <div className={`min-h-screen overflow-x-hidden bg-cream ${splashDone ? "" : "max-h-screen overflow-hidden"}`}>
        <ScrollToTop />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[2000] focus:rounded-pill focus:bg-gold focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-void"
        >
          {t("skip")}
        </a>

        <main id="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/katalog" element={<CosmeticsPage />} />
            <Route path="/uslugi/:slug" element={<ServiceRoute />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
}
