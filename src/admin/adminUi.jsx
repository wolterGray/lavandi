import { forwardRef, useEffect } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, CircleHelp, ExternalLink, Info, Loader2, Search, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getAdminNavMeta, getAdminPreviewPath } from "./adminNav";
import { ADMIN_LOCALE, adminRu } from "./adminStrings";

export function AdminTabs({ tabs, activeId, onChange }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-border/40 pb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-pill border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
            activeId === tab.id
              ? "border-gold/40 bg-gold/10 text-gold"
              : "border-border/50 text-stone hover:border-gold/30 hover:text-milk"
          }`}
        >
          {tab.label}
          {typeof tab.count === "number" && (
            <span className="ml-2 text-[10px] text-muted">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function AdminToggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-pill transition ${checked ? "bg-gold/80" : "bg-border/80"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-milk shadow transition ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
      {label && <span className="text-sm text-stone">{label}</span>}
    </label>
  );
}

export function AdminViewSiteButton({ href, label = adminRu.common.viewSection }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-1.5 rounded-pill border border-border/60 bg-transparent px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-stone transition hover:border-gold/30 hover:text-milk"
    >
      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      {label}
    </a>
  );
}

function formatSectionTime(value) {
  if (!value) return adminRu.common.neverEdited;
  try {
    return new Date(value).toLocaleString(ADMIN_LOCALE);
  } catch {
    return value;
  }
}

export function AdminBreadcrumbs() {
  const { pathname } = useLocation();
  const meta = getAdminNavMeta(pathname);
  if (!meta) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted">
      <Link to="/admin" className="transition hover:text-stone">
        {adminRu.nav.panel}
      </Link>
      <span>/</span>
      <span>{meta.group}</span>
      <span>/</span>
      <span className="text-stone">{meta.label}</span>
    </nav>
  );
}

export function AdminSectionMeta({ savedAt }) {
  return (
    <p className="mb-4 text-xs text-muted">
      {adminRu.common.lastEdited}: {formatSectionTime(savedAt)}
    </p>
  );
}

export function AdminDraftRecoveryBanner({ savedAt, onRestore, onDismiss }) {
  return (
    <AdminPanel className="mb-4 border-gold/30 bg-gold/[0.06]">
      <p className="text-sm text-milk">{adminRu.common.draftRecoveryHint}</p>
      <p className="mt-1 text-xs text-muted">{formatSectionTime(savedAt)}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <AdminButton onClick={onRestore}>{adminRu.common.draftRestore}</AdminButton>
        <AdminButton variant="ghost" onClick={onDismiss}>
          {adminRu.common.draftDismiss}
        </AdminButton>
      </div>
    </AdminPanel>
  );
}

export function AdminEmptyState({ message = adminRu.common.emptyList }) {
  return (
    <AdminPanel className="border-dashed text-center">
      <p className="text-sm text-stone">{message}</p>
    </AdminPanel>
  );
}

export function AdminSearchEmpty() {
  return <p className="mb-4 text-sm text-muted">{adminRu.common.searchNoResults}</p>;
}

export function AdminStickyCardHeader({ children, className = "" }) {
  return (
    <div
      className={`sticky top-0 z-[5] -mx-5 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/30 bg-card/95 px-5 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminTextarea({ value, onChange, maxLength, rows = 4, readOnly = false, className = "" }) {
  const length = String(value ?? "").length;
  return (
    <div>
      <textarea
        value={value ?? ""}
        readOnly={readOnly}
        rows={rows}
        maxLength={maxLength}
        onChange={onChange}
        className={adminInputClass(`resize-y ${className}`)}
      />
      {maxLength ? (
        <p className="mt-1 text-right text-[10px] text-muted">
          {adminRu.common.charCount(length, maxLength)}
        </p>
      ) : null}
    </div>
  );
}

export function AdminPageHeader({ title, description, actions, viewOnSite, sectionSavedAt }) {
  const { pathname } = useLocation();
  const previewHref = viewOnSite ?? getAdminPreviewPath(pathname);

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="font-display text-2xl text-milk sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone">{description}</p>}
        {sectionSavedAt !== undefined ? (
          <p className="mt-2 text-xs text-muted">
            {adminRu.common.lastEdited}: {formatSectionTime(sectionSavedAt)}
          </p>
        ) : null}
      </div>
      {(actions || previewHref) && (
        <div className="flex flex-wrap gap-2">
          {previewHref ? <AdminViewSiteButton href={previewHref} /> : null}
          {actions}
        </div>
      )}
    </div>
  );
}

export function AdminListSearch({ value, onChange, placeholder = adminRu.common.searchList }) {
  return (
    <div className="relative mb-4">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={adminInputClass("pl-10")}
      />
    </div>
  );
}

export const AdminPanel = forwardRef(function AdminPanel({ children, className = "" }, ref) {
  return (
    <div
      ref={ref}
      className={`rounded-card border border-border/50 bg-card p-5 shadow-spa sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
});

export function AdminField({ label, hint, help, children }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
        {label}
        {help ? (
          <span className="group relative inline-flex">
            <CircleHelp className="h-3.5 w-3.5 cursor-help text-muted" aria-hidden />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-56 -translate-x-1/2 rounded-card border border-border/50 bg-surface px-3 py-2 text-[11px] normal-case tracking-normal text-stone shadow-spa group-hover:block">
              {help}
            </span>
          </span>
        ) : null}
      </span>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </label>
  );
}

export function adminInputClass(extra = "") {
  return `w-full rounded-card border border-border/60 bg-surface px-3 py-2.5 text-sm text-milk outline-none transition placeholder:text-muted focus:border-gold/40 focus:ring-1 focus:ring-gold/20 ${extra}`;
}

export function AdminButton({ variant = "primary", loading = false, disabled, className = "", type = "button", children, ...props }) {
  const styles =
    variant === "ghost"
      ? "border border-border/60 bg-transparent text-stone hover:border-gold/30 hover:text-milk"
      : variant === "danger"
        ? "border border-red-900/40 bg-red-950/40 text-red-200 hover:border-red-700/60 hover:bg-red-900/40"
        : "border border-gold/35 bg-gold/10 text-gold hover:border-gold/50 hover:bg-gold/15";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-pill px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function AdminConfirmDialog({
  open,
  title,
  message,
  confirmLabel = adminRu.common.confirm,
  cancelLabel = adminRu.common.cancel,
  variant = "primary",
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onCancel?.();
      if (event.key === "Enter") onConfirm?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-void/80 p-4 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={onCancel}
      role="presentation"
    >
      <div className="w-full max-w-md" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <AdminPanel className={`border-2 ${isDanger ? "border-red-900/50 bg-surface/95" : "border-gold/30 bg-surface/95"}`}>
          <div className="flex items-start gap-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isDanger ? "bg-red-950/60 text-red-400 ring-1 ring-red-800/40" : "bg-gold/10 text-gold ring-1 ring-gold/20"}`}>
              {isDanger ? <AlertTriangle className="h-5 w-5" aria-hidden /> : <Info className="h-5 w-5" aria-hidden />}
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl text-milk">{title}</h3>
              {message ? <p className="mt-2 text-sm leading-relaxed text-stone">{message}</p> : null}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-2.5">
            <AdminButton variant="ghost" onClick={onCancel}>
              {cancelLabel}
            </AdminButton>
            <AdminButton variant={variant} onClick={onConfirm}>
              {confirmLabel}
            </AdminButton>
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}

export function AdminStatusToast({ message, tone = "info", onClose }) {
  if (!message) return null;

  const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? AlertCircle : Info;
  const tones = {
    success: "border-emerald-900/50 bg-emerald-950/80 text-emerald-100 ring-1 ring-emerald-500/20",
    error: "border-red-900/50 bg-red-950/80 text-red-100 ring-1 ring-red-500/20",
    info: "border-gold/40 bg-surface/90 text-gold ring-1 ring-gold/20",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-20 right-4 z-[190] flex items-center gap-3 max-w-md rounded-card border px-4 py-3.5 text-sm shadow-spa-hover backdrop-blur-md sm:bottom-6 sm:right-6 animate-in slide-in-from-bottom-5 duration-300 ${tones[tone] ?? tones.info}`}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      <span className="flex-1 font-medium">{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="rounded-full p-1 opacity-70 transition hover:opacity-100">
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function AdminSaveBar({
  onSave,
  onDiscard,
  dirty = false,
  saving = false,
  mode = "edit",
  hint,
}) {
  const statusText =
    hint ??
    (mode === "info"
      ? adminRu.common.settingsHint
      : dirty
        ? adminRu.common.unsavedChanges
        : adminRu.common.noUnsavedChanges);

  useEffect(() => {
    if (mode !== "edit" || !dirty || !onSave || saving) return undefined;

    const onKeyDown = (event) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      onSave();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dirty, mode, onSave, saving]);

  if (mode === "edit" && !dirty && !saving) {
    return null;
  }

  return (
    <div className="sticky bottom-6 z-30 mt-8 flex flex-wrap items-center justify-between gap-4 rounded-pill border border-gold/30 bg-surface/95 px-5 py-3 shadow-spa-hover backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-2.5 text-xs text-milk">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-gold" />
        </span>
        <span className="font-semibold">{statusText}</span>
        {mode === "edit" && dirty ? (
          <kbd className="hidden rounded border border-border/60 bg-void/50 px-1.5 py-0.5 text-[10px] text-muted sm:inline-block">⌘S</kbd>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {mode === "edit" && dirty && onDiscard && (
          <AdminButton variant="ghost" onClick={onDiscard} disabled={saving}>
            {adminRu.common.discard}
          </AdminButton>
        )}
        <AdminButton
          onClick={onSave}
          loading={saving}
          disabled={saving || mode !== "edit" || !dirty || !onSave}
        >
          {saving ? adminRu.common.saving : adminRu.common.save}
        </AdminButton>
      </div>
    </div>
  );
}
