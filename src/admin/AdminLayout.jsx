import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ChevronDown, ExternalLink, LogOut, Search } from "lucide-react";
import { AdminBreadcrumbs } from "./adminUi";
import { useAdminAuth } from "./AdminAuthContext";
import { ADMIN_LOCALE, adminRu } from "./adminStrings";
import { ADMIN_NAV_GROUPS } from "./adminNav";
import { AdminShellProvider, useAdminShell } from "./AdminShellContext";
import { useContent } from "../context/ContentProvider";

function formatSyncTime(value) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleString(ADMIN_LOCALE);
  } catch {
    return value;
  }
}

const NAV_COLLAPSE_KEY = "nuar-admin-nav-collapsed";

function readCollapsedGroups() {
  try {
    const raw = localStorage.getItem(NAV_COLLAPSE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function AdminLayoutInner() {
  const { logout, userEmail } = useAdminAuth();
  const { hasOverrides, isSupabaseEnabled, contentLoading, contentSaving, syncError, lastSyncedAt } = useContent();
  const { isAnyDirty, setCommandOpen } = useAdminShell();
  const navigate = useNavigate();
  const [collapsedGroups, setCollapsedGroups] = useState(readCollapsedGroups);

  useEffect(() => {
    localStorage.setItem(NAV_COLLAPSE_KEY, JSON.stringify(collapsedGroups));
  }, [collapsedGroups]);

  const toggleGroup = (label) => {
    setCollapsedGroups((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label]
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-void text-milk">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-border/60 bg-surface lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
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
              <p className="mt-2 hidden truncate text-xs text-muted lg:block">{userEmail}</p>
            )}
          </div>

          <div className="px-3 pb-2 lg:px-3">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="flex w-full items-center gap-2 rounded-card border border-border/50 px-3 py-2.5 text-sm text-stone transition hover:border-gold/30 hover:text-milk"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden />
              <span className="flex-1 text-left">{adminRu.common.commandPalette}</span>
              <kbd className="rounded border border-border/50 px-1.5 py-0.5 text-[10px] text-muted">⌘K</kbd>
            </button>
          </div>

          <nav className="flex max-h-[50vh] flex-col gap-4 overflow-x-auto overflow-y-auto px-3 pb-3 lg:max-h-[calc(100vh-14rem)] lg:px-3 lg:pb-6">
            {ADMIN_NAV_GROUPS.map((group) => {
              const collapsed = collapsedGroups.includes(group.label);
              return (
              <div key={group.label}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  className="mb-2 flex w-full items-center justify-between px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted transition hover:text-stone"
                >
                  <span>{group.label}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition ${collapsed ? "-rotate-90" : ""}`} aria-hidden />
                </button>
                {!collapsed ? (
                <div className="flex gap-1 lg:flex-col">
                  {group.items.map(({ to, end, label, icon: Icon }) => (
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
                </div>
                ) : null}
              </div>
            );
            })}
          </nav>

          <div className="hidden border-t border-border/40 px-3 py-4 lg:block">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-card px-3 py-2.5 text-sm text-stone transition hover:bg-card/60 hover:text-milk"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              {adminRu.nav.viewSite}
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-2 rounded-card px-3 py-2.5 text-sm text-stone transition hover:bg-card/60 hover:text-milk"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              {adminRu.nav.logout}
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-6 pb-20 sm:px-8 lg:py-8 lg:pb-8">
          {isAnyDirty && (
            <div className="mb-4 rounded-card border border-amber-900/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
              {adminRu.common.unsavedChangesBanner}
            </div>
          )}

          {isSupabaseEnabled && (
            <div className="mb-6 rounded-card border border-border/50 bg-card/60 px-4 py-3 text-sm text-stone">
              {contentLoading ? (
                <p>{adminRu.common.loadingContent}</p>
              ) : syncError ? (
                <p className="text-red-300">
                  {adminRu.common.syncError}: {syncError}
                </p>
              ) : (
                <p>
                  {adminRu.common.contentSynced}
                  {lastSyncedAt ? ` · ${adminRu.common.lastUpdate}: ${formatSyncTime(lastSyncedAt)}` : ""}.
                </p>
              )}
            </div>
          )}
          <AdminBreadcrumbs />
          <Outlet />
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-2 border-t border-border/60 bg-surface/95 px-3 py-2 backdrop-blur-sm lg:hidden">
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-card px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-stone"
        >
          <Search className="h-4 w-4" aria-hidden />
          {adminRu.common.commandPalette}
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-card px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-stone"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center rounded-card px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-stone"
          aria-label={adminRu.nav.logout}
        >
          <LogOut className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminShellProvider>
      <AdminLayoutInner />
    </AdminShellProvider>
  );
}
