import { useEffect, useState } from "react";
import { Routes, Route, useParams, Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "./i18n/LanguageProvider";
import LandingPage from "./pages/LandingPage";
import ServicePage from "./pages/ServicePage";
import CosmeticsPage from "./pages/CosmeticsPage";
import CosmeticProductPage from "./pages/CosmeticProductPage";
import NotFoundPage from "./pages/NotFoundPage";
import SplashScreen from "./ui/SplashScreen";
import AdminLayout from "./admin/AdminLayout";
import AdminProtected from "./admin/AdminProtected";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminHomePage from "./pages/admin/AdminHomePage";
import AdminServicesPage from "./pages/admin/AdminServicesPage";
import AdminAboutPage from "./pages/admin/AdminAboutPage";
import AdminTrustPage from "./pages/admin/AdminTrustPage";
import AdminStatsPage from "./pages/admin/AdminStatsPage";
import AdminTeamPage from "./pages/admin/AdminTeamPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminGalleryPage from "./pages/admin/AdminGalleryPage";
import AdminFaqPage from "./pages/admin/AdminFaqPage";
import AdminCosmeticsPage from "./pages/admin/AdminCosmeticsPage";
import AdminContactPage from "./pages/admin/AdminContactPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import { useContent } from "./context/ContentProvider";
import { findLocalizedProduct } from "./components/CosmeticsSection/cosmeticsShared";
import { usePageAnalytics } from "./hooks/usePageAnalytics";

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

function CosmeticProductRoute() {
  const { id } = useParams();
  const { t, lang } = useTranslation();
  const { cosmetics, getProductTexts } = useContent();
  const product = findLocalizedProduct(cosmetics, id, t, lang, getProductTexts);
  if (!product) return <NotFoundPage />;
  return <CosmeticProductPage product={product} />;
}

function PublicSiteWithAnalytics() {
  const { siteSettings } = useContent();
  usePageAnalytics(siteSettings);
  return <PublicSite />;
}

function PublicSite() {
  const { t } = useTranslation();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (splashDone) return undefined;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [splashDone]);

  return (
    <>
      <SplashScreen onDone={() => setSplashDone(true)} />

      <div className="min-h-screen overflow-x-hidden bg-cream">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[2000] focus:rounded-pill focus:bg-gold focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-void"
        >
          {t("skip")}
        </a>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/katalog" element={<CosmeticsPage />} />
          <Route path="/katalog/:id" element={<CosmeticProductRoute />} />
          <Route path="/uslugi/:slug" element={<ServiceRoute />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminProtected>
              <AdminLayout />
            </AdminProtected>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="home" element={<AdminHomePage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="about" element={<AdminAboutPage />} />
          <Route path="trust" element={<AdminTrustPage />} />
          <Route path="stats" element={<AdminStatsPage />} />
          <Route path="team" element={<AdminTeamPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="gallery" element={<AdminGalleryPage />} />
          <Route path="faq" element={<AdminFaqPage />} />
          <Route path="cosmetics" element={<AdminCosmeticsPage />} />
          <Route path="contact" element={<AdminContactPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
        <Route
          path="/*"
          element={
            <main id="main-content">
              <PublicSiteWithAnalytics />
            </main>
          }
        />
      </Routes>
    </>
  );
}
