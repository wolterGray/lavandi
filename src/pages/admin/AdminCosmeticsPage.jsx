import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { localeDefaults } from "../../admin/siteContent";
import { LangTabs, useAdminPersist } from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import { CATEGORY_KEYS } from "../../components/CosmeticsSection/cosmeticsShared";
import { AdminButton, AdminField, AdminPageHeader, AdminPanel, AdminSaveBar, adminInputClass } from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

const PRODUCT_CATEGORIES = CATEGORY_KEYS.filter((key) => key !== "all");

export default function AdminCosmeticsPage() {
  const { cosmetics, overrides } = useContent();
  const { contentSaving, saveError, runSave, saveMerged, patchLocaleBlock } = useAdminPersist();
  const [activeLang, setActiveLang] = useState("pl");
  const [draft, setDraft] = useState(cosmetics);
  const [textDraft, setTextDraft] = useState({});
  const [dirty, setDirty] = useState(false);

  const defaultTexts = useMemo(() => {
    const products = {};
    cosmetics.forEach((product) => {
      const base = localeDefaults[activeLang]?.cosmetics?.products?.[product.id] ?? {};
      const override = overrides.locales?.[activeLang]?.cosmetics?.products?.[product.id] ?? {};
      products[product.id] = { ...base, ...override };
    });
    return products;
  }, [cosmetics, activeLang, overrides.locales]);

  useEffect(() => {
    setDraft(cosmetics);
    setTextDraft(defaultTexts);
    setDirty(false);
  }, [cosmetics, defaultTexts]);

  const updateItem = (index, patch) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    setDirty(true);
  };

  const updateText = (productId, patch) => {
    setTextDraft((prev) => ({ ...prev, [productId]: { ...prev[productId], ...patch } }));
    setDirty(true);
  };

  const addItem = () => {
    const id = `product-${Date.now()}`;
    setDraft((prev) => [...prev, { id, category: "oils", initials: "NU", accent: 0 }]);
    setTextDraft((prev) => ({ ...prev, [id]: { name: "", brand: "", tagline: "" } }));
    setDirty(true);
  };

  const removeItem = (index) => {
    const id = draft[index]?.id;
    setDraft((prev) => prev.filter((_, i) => i !== index));
    if (id) {
      setTextDraft((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    setDirty(true);
  };

  const handleSave = async () => {
    const ok = await runSave(() =>
      saveMerged((current) => {
        const next = { ...current, cosmetics: draft };
        return patchLocaleBlock(next, activeLang, "cosmetics", { products: textDraft });
      })
    );
    if (ok) setDirty(false);
  };

  return (
    <>
      <AdminPageHeader
        title={adminRu.nav.cosmetics}
        description="Каталог продуктов — структурные данные и тексты на выбранном языке сайта."
        actions={<AdminButton onClick={addItem}><Plus className="mr-1 h-3.5 w-3.5" /> Добавить продукт</AdminButton>}
      />

      <LangTabs activeLang={activeLang} onChange={setActiveLang} />

      <div className="space-y-4">
        {draft.map((item, index) => {
          const texts = textDraft[item.id] ?? {};
          return (
            <AdminPanel key={`${item.id}-${index}`}>
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display text-lg text-milk">{item.id}</p>
                <AdminButton variant="danger" onClick={() => removeItem(index)} aria-label={adminRu.common.delete}>
                  <Trash2 className="h-4 w-4" />
                </AdminButton>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <AdminField label="ID"><input value={item.id} onChange={(e) => updateItem(index, { id: e.target.value })} className={adminInputClass()} /></AdminField>
                <AdminField label={adminRu.common.category}>
                  <select value={item.category} onChange={(e) => updateItem(index, { category: e.target.value })} className={adminInputClass()}>
                    {PRODUCT_CATEGORIES.map((key) => <option key={key} value={key}>{key}</option>)}
                  </select>
                </AdminField>
                <AdminField label={adminRu.common.initials}><input value={item.initials} maxLength={3} onChange={(e) => updateItem(index, { initials: e.target.value.toUpperCase() })} className={adminInputClass()} /></AdminField>
                <AdminField label={adminRu.common.accent}><input type="number" min="0" max="5" value={item.accent} onChange={(e) => updateItem(index, { accent: Number(e.target.value) || 0 })} className={adminInputClass()} /></AdminField>
              </div>
              <div className="mt-4 border-t border-border/20 pt-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-gold">{adminRu.common.texts} · {activeLang.toUpperCase()}</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <AdminField label={adminRu.common.name}><input value={texts.name ?? ""} onChange={(e) => updateText(item.id, { name: e.target.value })} className={adminInputClass()} /></AdminField>
                  <AdminField label={adminRu.common.brand}><input value={texts.brand ?? ""} onChange={(e) => updateText(item.id, { brand: e.target.value })} className={adminInputClass()} /></AdminField>
                  <AdminField label={adminRu.common.tagline}><input value={texts.tagline ?? ""} onChange={(e) => updateText(item.id, { tagline: e.target.value })} className={adminInputClass()} /></AdminField>
                </div>
              </div>
            </AdminPanel>
          );
        })}
      </div>

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={dirty} saving={contentSaving} onSave={handleSave} onDiscard={() => { setDraft(cosmetics); setTextDraft(defaultTexts); setDirty(false); }} />
    </>
  );
}
