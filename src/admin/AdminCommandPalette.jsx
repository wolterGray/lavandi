import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { flattenAdminNav } from "./adminNav";
import { adminRu } from "./adminStrings";
import { AdminPanel } from "./adminUi";

function normalizeQuery(value) {
  return value.trim().toLowerCase();
}

export default function AdminCommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");

  const items = useMemo(() => flattenAdminNav(), []);

  const filtered = useMemo(() => {
    const q = normalizeQuery(query);
    if (!q) return items;
    return items.filter((item) => {
      const haystack = `${item.label} ${item.group} ${item.keywords ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const go = (to) => {
    navigate(to);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[210] flex items-start justify-center bg-void/80 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div className="w-full max-w-lg" onClick={(event) => event.stopPropagation()} role="presentation">
      <AdminPanel className="border-gold/25 p-0">
        <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={adminRu.common.commandSearch}
            className="w-full bg-transparent text-sm text-milk outline-none placeholder:text-muted"
          />
          <kbd className="hidden rounded border border-border/50 px-1.5 py-0.5 text-[10px] text-muted sm:inline">
            Esc
          </kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-muted">{adminRu.common.commandEmpty}</li>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <button
                    type="button"
                    onClick={() => go(item.to)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-stone transition hover:bg-card/80 hover:text-milk"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-gold" aria-hidden />
                    <span className="flex-1">{item.label}</span>
                    <span className="text-[10px] uppercase tracking-[0.12em] text-muted">{item.group}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
        <p className="border-t border-border/40 px-4 py-2 text-[10px] text-muted">
          {adminRu.common.commandHint}
        </p>
      </AdminPanel>
      </div>
    </div>
  );
}
