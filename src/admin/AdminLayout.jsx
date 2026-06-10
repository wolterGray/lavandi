import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ExternalLink,
  HelpCircle,
  Home,
  Images,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  Settings,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useAdminAuth } from "./AdminAuthContext";
import { ADMIN_LOCALE, adminRu } from "./adminStrings";
import { useContent } from "../context/ContentProvider";

const NAV = [
  { to: "/admin", end: true, label: adminRu.nav.panel, icon: LayoutDashboard },
  { to: "/admin/home", label: adminRu.nav.home, icon: Home },
  { to: "/admin/services", label: adminRu.nav.services, icon: Sparkles },
  { to: "/admin/cosmetics", label: adminRu.nav.cosmetics, icon: Package },
  { to: "/admin/about", label: adminRu.nav.about, icon: Star },
  { to: "/admin/trust", label: adminRu.nav.trust, icon: Star },
  { to: "/admin/stats", label: adminRu.nav.stats, icon: Star },
  { to: "/admin/team", label: adminRu.nav.team, icon: Users },
  { to: "/admin/reviews", label: adminRu.nav.reviews, icon: MessageSquare },
  { to: "/admin/gallery", label: adminRu.nav.gallery, icon: Images },
  { to: "/admin/faq", label: adminRu.nav.faq, icon: HelpCircle },
  { to: "/admin/contact", label: adminRu.nav.contact, icon: MapPin },
  { to: "/admin/settings", label: adminRu.nav.settings, icon: Settings },
];

function formatSyncTime(value) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleString(ADMIN_LOCALE);
  } catch {
    return value;
  }
}

export default function AdminLayout() {
  const { logout, userEmail } = useAdminAuth();
  const { hasOverrides, isSupabaseEnabled, contentLoading, contentSaving, syncError, lastSyncedAt } = useContent();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-void text-milk">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-border/60 bg-surface lg:w-64 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-5 py-5 lg:block">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">NUAR</p>
              <h1 className="mt-1 font-display text-xl">{adminRu.nav.adminTitle}</h1>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 lg:mt-3">
              {isSupabaseEnabled ? (
                <span className="rounded-pill border border-emerald-900/40 bg-emerald-950/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-200">
                  Supabase
                </span>
              ) : (
                hasOverrides && (
                  <span className="rounded-pill border border-gold/30 bg-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gold">
                    {adminRu.nav.localOnly}
                  </span>
                )
              )}
              {contentSaving && (
                <span className="rounded-pill border border-border/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-stone">
                  {adminRu.common.saving}
                </span>
              )}
            </div>
            {isSupabaseEnabled && userEmail && (
              <p className="mt-2 hidden text-xs text-muted lg:block">{userEmail}</p>
            )}
          </div>

          <nav className="flex max-h-[50vh] gap-1 overflow-x-auto overflow-y-auto px-3 pb-3 lg:max-h-none lg:flex-col lg:px-3 lg:pb-6">
            {NAV.map(({ to, end, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-card px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-card text-gold ring-1 ring-gold/20"
                      : "text-stone hover:bg-card/60 hover:text-milk"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden border-t border-border/40 px-3 py-4 lg:block">
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-card px-3 py-2.5 text-sm text-stone transition hover:bg-card/60 hover:text-milk">
              <ExternalLink className="h-4 w-4" aria-hidden />
              {adminRu.nav.viewSite}
            </a>
            <button type="button" onClick={handleLogout} className="mt-1 flex w-full items-center gap-2 rounded-card px-3 py-2.5 text-sm text-stone transition hover:bg-card/60 hover:text-milk">
              <LogOut className="h-4 w-4" aria-hidden />
              {adminRu.nav.logout}
            </button>
          </div>
        </aside>

        <main className="flex-1 px-5 py-6 sm:px-8 lg:py-8">
          {isSupabaseEnabled && (
            <div className="mb-6 rounded-card border border-border/50 bg-card/60 px-4 py-3 text-sm text-stone">
              {contentLoading ? (
                <p>{adminRu.common.loadingContent}</p>
              ) : syncError ? (
                <p className="text-red-300">{adminRu.common.syncError}: {syncError}</p>
              ) : (
                <p>
                  {adminRu.common.contentSynced}
                  {lastSyncedAt ? ` · ${adminRu.common.lastUpdate}: ${formatSyncTime(lastSyncedAt)}` : ""}.
                </p>
              )}
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
