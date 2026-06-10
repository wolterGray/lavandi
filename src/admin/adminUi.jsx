import { adminRu } from "./adminStrings";

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

export function AdminPageHeader({ title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="font-display text-2xl text-milk sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function AdminPanel({ children, className = "" }) {
  return (
    <div className={`rounded-card border border-border/50 bg-card p-5 shadow-spa sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

export function AdminField({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">{label}</span>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </label>
  );
}

export function adminInputClass(extra = "") {
  return `w-full rounded-card border border-border/60 bg-surface px-3 py-2.5 text-sm text-milk outline-none transition placeholder:text-muted focus:border-gold/40 focus:ring-1 focus:ring-gold/20 ${extra}`;
}

export function AdminButton({ variant = "primary", className = "", type = "button", ...props }) {
  const styles =
    variant === "ghost"
      ? "border border-border/60 bg-transparent text-stone hover:border-gold/30 hover:text-milk"
      : variant === "danger"
        ? "border border-red-900/40 bg-red-950/30 text-red-200 hover:border-red-700/50"
        : "border border-gold/35 bg-gold/10 text-gold hover:border-gold/50 hover:bg-gold/15";

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-pill px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
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

  return (
    <div className="sticky bottom-4 z-10 mt-8 flex flex-wrap items-center justify-end gap-2 rounded-card border border-gold/25 bg-surface/95 p-3 shadow-spa-hover backdrop-blur-sm">
      <span className="mr-auto text-xs text-stone">{statusText}</span>
      {mode === "edit" && dirty && onDiscard && (
        <AdminButton variant="ghost" onClick={onDiscard} disabled={saving}>
          {adminRu.common.discard}
        </AdminButton>
      )}
      <AdminButton
        onClick={onSave}
        disabled={saving || mode !== "edit" || !dirty || !onSave}
      >
        {saving ? adminRu.common.saving : adminRu.common.save}
      </AdminButton>
    </div>
  );
}
