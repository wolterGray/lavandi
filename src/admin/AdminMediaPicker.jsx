import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { adminRu } from "./adminStrings";
import { fetchSiteImagesCatalog } from "./siteImages";
import { AdminButton, AdminPanel, adminInputClass } from "./adminUi";

export default function AdminMediaPicker({ open, folder, onSelect, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const catalog = await fetchSiteImagesCatalog({ folder });
        if (!cancelled) setItems(catalog);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, folder]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => item.id.toLowerCase().includes(normalized));
  }, [items, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[205] flex items-start justify-center bg-void/80 p-4 pt-[10vh] backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div className="w-full max-w-3xl" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <AdminPanel className="border-gold/25 p-0">
          <div className="border-b border-border/40 px-4 py-3">
            <h3 className="font-display text-lg text-milk">{adminRu.media.libraryTitle}</h3>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={adminRu.media.librarySearch}
                className={adminInputClass("pl-10")}
              />
            </div>
          </div>

          <div className="max-h-[55vh] overflow-y-auto p-4">
            {loading ? (
              <p className="text-sm text-stone">{adminRu.common.loadingContent}</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted">{adminRu.media.libraryEmpty}</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item.ref);
                      onClose();
                    }}
                    className="overflow-hidden rounded-card border border-border/50 bg-surface text-left transition hover:border-gold/40"
                  >
                    <div className="flex aspect-square items-center justify-center bg-void/20 p-2">
                      {item.dataUrl ? (
                        <img src={item.dataUrl} alt="" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-muted">preview</span>
                      )}
                    </div>
                    <p className="truncate px-2 py-1.5 text-[10px] text-muted">{item.id}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end border-t border-border/40 px-4 py-3">
            <AdminButton variant="ghost" onClick={onClose}>
              {adminRu.common.cancel}
            </AdminButton>
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
