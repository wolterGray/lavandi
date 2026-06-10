import {
  BarChart3,
  HelpCircle,
  Home,
  Images,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Package,
  Settings,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { adminRu } from "./adminStrings";

export const ADMIN_NAV_GROUPS = [
  {
    label: adminRu.nav.groupContent,
    items: [
      { to: "/admin", end: true, label: adminRu.nav.panel, icon: LayoutDashboard, keywords: "dashboard панель главная" },
      { to: "/admin/home", label: adminRu.nav.home, icon: Home, keywords: "hero слайды новости главная" },
      { to: "/admin/services", label: adminRu.nav.services, icon: Sparkles, keywords: "услуги spa массаж" },
      { to: "/admin/cosmetics", label: adminRu.nav.cosmetics, icon: Package, keywords: "косметика каталог товары" },
      { to: "/admin/gallery", label: adminRu.nav.gallery, icon: Images, keywords: "галерея фото" },
      { to: "/admin/reviews", label: adminRu.nav.reviews, icon: MessageSquare, keywords: "отзывы гости" },
    ],
  },
  {
    label: adminRu.nav.groupSite,
    items: [
      { to: "/admin/about", label: adminRu.nav.about, icon: Star, keywords: "философия о нас about" },
      { to: "/admin/trust", label: adminRu.nav.trust, icon: Star, keywords: "доверие trust" },
      { to: "/admin/stats", label: adminRu.nav.stats, icon: Star, keywords: "статистика цифры" },
      { to: "/admin/team", label: adminRu.nav.team, icon: Users, keywords: "команда мастера" },
      { to: "/admin/faq", label: adminRu.nav.faq, icon: HelpCircle, keywords: "вопросы faq" },
      { to: "/admin/contact", label: adminRu.nav.contact, icon: MapPin, keywords: "контакты адрес карта" },
    ],
  },
  {
    label: adminRu.nav.groupSystem,
    items: [
      { to: "/admin/analytics", label: adminRu.nav.analytics, icon: BarChart3, keywords: "аналитика ga4 google" },
      { to: "/admin/settings", label: adminRu.nav.settings, icon: Settings, keywords: "настройки экспорт импорт" },
    ],
  },
];

export const ADMIN_PREVIEW_PATHS = {
  "/admin": "/",
  "/admin/home": "/",
  "/admin/services": "/#services",
  "/admin/cosmetics": "/katalog",
  "/admin/gallery": "/#gallery",
  "/admin/reviews": "/#reviews",
  "/admin/about": "/#about",
  "/admin/trust": "/#trust",
  "/admin/stats": "/#stats",
  "/admin/team": "/#team",
  "/admin/faq": "/#faq",
  "/admin/contact": "/#contact",
  "/admin/analytics": "/",
  "/admin/settings": "/",
};

export function flattenAdminNav() {
  return ADMIN_NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => ({ ...item, group: group.label }))
  );
}

export function getAdminPreviewPath(pathname) {
  return ADMIN_PREVIEW_PATHS[pathname] ?? "/";
}

export function getAdminNavMeta(pathname) {
  for (const group of ADMIN_NAV_GROUPS) {
    const item = group.items.find((entry) =>
      entry.end ? pathname === entry.to : pathname.startsWith(entry.to)
    );
    if (item) {
      return { group: group.label, label: item.label, to: item.to };
    }
  }
  return null;
}

export const ADMIN_SECTION_KEYS = {
  "/admin/home": "home",
  "/admin/services": "services",
  "/admin/cosmetics": "cosmetics",
  "/admin/gallery": "gallery",
  "/admin/reviews": "reviews",
  "/admin/about": "about",
  "/admin/trust": "trust",
  "/admin/stats": "stats",
  "/admin/team": "team",
  "/admin/faq": "faq",
  "/admin/contact": "contact",
  "/admin/analytics": "analytics",
  "/admin/settings": "settings",
};

export function getAdminSectionKey(pathname) {
  return ADMIN_SECTION_KEYS[pathname] ?? null;
}
