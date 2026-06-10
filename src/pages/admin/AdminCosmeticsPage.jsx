import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { localeDefaults } from "../../admin/siteContent";
import {
  LangTabs,
  createCosmeticId,
  deriveCosmeticInitials,
  useAdminPersist,
} from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import {
  CATEGORY_KEYS,
  generateCosmeticNumericId,
  MAX_FEATURED_COSMETICS,
  normalizeFeaturedCosmeticIds,
  PLACEHOLDER_GRADIENTS,
} from "../../components/CosmeticsSection/cosmeticsShared";
import AdminImageField from "../../admin/AdminImageField";
import { deleteSiteImageByRef, isImageRef } from "../../admin/siteImages";
import { AdminButton, AdminField, AdminPageHeader, AdminPanel, AdminSaveBar, adminInputClass } from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";
import { normalizeCosmeticCopy } from "../../components/CosmeticsSection/cosmeticsShared";

const PRODUCT_CATEGORIES = CATEGORY_KEYS.filter((key) => key !== "all");

const EMPTY_PRODUCT_TEXT = {
  name: "",
  description: "",
  volume: "",
  composition: "",
};

function buildDefaultTexts(cosmetics, activeLang, overrides) {
  const products = {};
  cosmetics.forEach((product) => {
    const base = localeDefaults[activeLang]?.cosmetics?.products?.[product.id] ?? {};
    const override = overrides.locales?.[activeLang]?.cosmetics?.products?.[product.id] ?? {};
    products[product.id] = normalizeCosmeticCopy({ ...base, ...override });
  });
  return products;
}

export default function AdminCosmeticsPage() {
  const { cosmetics, featuredCosmeticIds, cosmeticRetiredIds, overrides } = useContent();
  const { contentSaving, saveError, runSave, saveMerged, patchLocaleBlock } = useAdminPersist();
  const [activeLang, setActiveLang] = useState("pl");
  const [draft, setDraft] = useState(cosmetics);
  const [textDraft, setTextDraft] = useState({});
  const [featuredDraft, setFeaturedDraft] = useState(featuredCosmeticIds);
  const [retiredDraft, setRetiredDraft] = useState(cosmeticRetiredIds);
  const [dirty, setDirty] = useState(false);
  const [idPickerOpen, setIdPickerOpen] = useState(false);
  const [selectedRetiredId, setSelectedRetiredId] = useState("");
  const [featuredLimitHint, setFeaturedLimitHint] = useState("");

  const defaultTexts = useMemo(
    () => buildDefaultTexts(cosmetics, activeLang, overrides),
    [cosmetics, activeLang, overrides.locales]
  );

  const activeIds = useMemo(() => draft.map((item) => item.id), [draft]);

  useEffect(() => {
    setDraft(cosmetics);
    setTextDraft(defaultTexts);
    setFeaturedDraft(normalizeFeaturedCosmeticIds(featuredCosmeticIds, cosmetics));
    setRetiredDraft(cosmeticRetiredIds);
    setDirty(false);
  }, [cosmetics, defaultTexts, featuredCosmeticIds, cosmeticRetiredIds]);

  useEffect(() => {
    if (!idPickerOpen) return;
    setSelectedRetiredId(retiredDraft[0] ?? "");
  }, [idPickerOpen, retiredDraft]);

  const updateItem = (index, patch) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    setDirty(true);
  };

  const updateText = (productId, patch) => {
    setTextDraft((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], ...patch },
    }));
    setDirty(true);
  };

  const addProductToDraft = (id, { fromRetired = false } = {}) => {
    if (fromRetired) {
      setRetiredDraft((prev) => prev.filter((retiredId) => retiredId !== id));
    }

    setDraft((prev) => [
      ...prev,
      {
        id,
        category: "oils",
        initials: "NU",
        accent: prev.length % PLACEHOLDER_GRADIENTS.length,
      },
    ]);
    setTextDraft((prev) => ({ ...prev, [id]: { ...EMPTY_PRODUCT_TEXT } }));

    setFeaturedDraft((prev) => {
      if (prev.includes(id) || prev.length >= MAX_FEATURED_COSMETICS) return prev;
      return [...prev, id];
    });

    setDirty(true);
    setIdPickerOpen(false);
  };

  const startAddProduct = () => {
    if (retiredDraft.length > 0) {
      setIdPickerOpen(true);
      return;
    }
    const id = generateCosmeticNumericId(activeIds, retiredDraft);
    addProductToDraft(id);
  };

  const addWithRetiredId = () => {
    if (!selectedRetiredId) return;
    addProductToDraft(selectedRetiredId, { fromRetired: true });
  };

  const addWithNewId = () => {
    const id = generateCosmeticNumericId(activeIds, retiredDraft);
    addProductToDraft(id);
  };

  const toggleFeatured = (productId) => {
    setFeaturedLimitHint("");
    setFeaturedDraft((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= MAX_FEATURED_COSMETICS) {
        setFeaturedLimitHint(adminRu.cosmetics.featuredLimit(MAX_FEATURED_COSMETICS));
        return prev;
      }
      return [...prev, productId];
    });
    setDirty(true);
  };

  const removeItem = async (index) => {
    const item = draft[index];
    const id = item?.id;

    if (item?.img && isImageRef(item.img)) {
      try {
        await deleteSiteImageByRef(item.img);
      } catch {
        // product row is still removed from catalog even if DB delete fails
      }
    }

    setDraft((prev) => prev.filter((_, i) => i !== index));
    if (id) {
      setTextDraft((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setFeaturedDraft((prev) => prev.filter((featuredId) => featuredId !== id));
      setRetiredDraft((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
    setDirty(true);
  };

  const handleSave = async () => {
    const enriched = draft.map((item, index) => {
      const texts = textDraft[item.id] ?? EMPTY_PRODUCT_TEXT;
      return {
        ...item,
        initials: deriveCosmeticInitials(texts.name),
        accent: item.accent ?? index % PLACEHOLDER_GRADIENTS.length,
      };
    });

    const ok = await runSave(() =>
      saveMerged((current) => {
        const next = {
          ...current,
          cosmetics: enriched,
          featuredCosmeticIds: normalizeFeaturedCosmeticIds(featuredDraft, enriched),
          cosmeticRetiredIds: retiredDraft.filter((id) => !enriched.some((item) => item.id === id)),
        };
        return patchLocaleBlock(next, activeLang, "cosmetics", { products: textDraft });
      })
    );
    if (ok) setDirty(false);
  };

  return (
    <>
      <AdminPageHeader
        title={adminRu.nav.cosmetics}
        description={adminRu.cosmetics.description}
        actions={
          <AdminButton onClick={startAddProduct}>
            <Plus className="mr-1 h-3.5 w-3.5" /> {adminRu.cosmetics.addProduct}
          </AdminButton>
        }
      />

      <LangTabs activeLang={activeLang} onChange={setActiveLang} />

      {idPickerOpen ? (
        <AdminPanel className="mb-4 border-gold/30">
          <p className="font-display text-lg text-milk">{adminRu.cosmetics.idPickerTitle}</p>
          <p className="mt-2 text-sm text-stone">{adminRu.cosmetics.idPickerHint}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
            <AdminField label={adminRu.cosmetics.retiredId}>
              <select
                value={selectedRetiredId}
                onChange={(e) => setSelectedRetiredId(e.target.value)}
                className={adminInputClass()}
              >
                {retiredDraft.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminButton onClick={addWithRetiredId}>{adminRu.cosmetics.useRetiredId}</AdminButton>
            <AdminButton variant="secondary" onClick={addWithNewId}>
              {adminRu.cosmetics.generateNewId}
            </AdminButton>
          </div>
          <button
            type="button"
            onClick={() => setIdPickerOpen(false)}
            className="mt-4 text-xs text-muted transition hover:text-stone"
          >
            {adminRu.cosmetics.cancelAdd}
          </button>
        </AdminPanel>
      ) : null}

      {featuredLimitHint ? <p className="mb-4 text-sm text-gold">{featuredLimitHint}</p> : null}

      <div className="space-y-4">
        {draft.map((item, index) => {
          const texts = textDraft[item.id] ?? EMPTY_PRODUCT_TEXT;
          const isFeatured = featuredDraft.includes(item.id);
          return (
            <AdminPanel key={item.id}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-milk">
                    {texts.name?.trim() || adminRu.cosmetics.newProduct}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">
                    {adminRu.cosmetics.productId}: {item.id}
                  </p>
                </div>
                <AdminButton variant="danger" onClick={() => removeItem(index)} aria-label={adminRu.common.delete}>
                  <Trash2 className="h-4 w-4" />
                </AdminButton>
              </div>

              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                {adminRu.cosmetics.cardSection}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <AdminImageField
                    folder="cosmetics"
                    label={adminRu.cosmetics.photo}
                    value={item.img}
                    previewClassName="mt-3 h-40 w-full max-w-xs rounded-card bg-void object-contain object-center p-3 ring-1 ring-border/50"
                    onChange={(img) => updateItem(index, { img: img || undefined })}
                  />
                </div>

                <AdminField label={adminRu.cosmetics.category}>
                  <select
                    value={item.category}
                    onChange={(e) => updateItem(index, { category: e.target.value })}
                    className={adminInputClass()}
                  >
                    {PRODUCT_CATEGORIES.map((key) => (
                      <option key={key} value={key}>
                        {adminRu.cosmetics.categories[key] ?? key}
                      </option>
                    ))}
                  </select>
                </AdminField>

                <AdminField label={adminRu.cosmetics.featured}>
                  <label className="flex min-h-[42px] cursor-pointer items-center gap-3 rounded-card border border-border/50 bg-surface px-3">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={() => toggleFeatured(item.id)}
                      className="h-4 w-4 accent-gold"
                    />
                    <span className="text-sm text-stone">
                      {isFeatured
                        ? adminRu.cosmetics.featuredOn
                        : adminRu.cosmetics.featuredOff}
                    </span>
                  </label>
                </AdminField>
              </div>

              <div className="mt-4 border-t border-border/20 pt-4">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                  {adminRu.cosmetics.siteTexts} · {activeLang.toUpperCase()}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label={adminRu.cosmetics.name}>
                    <input
                      value={texts.name ?? ""}
                      onChange={(e) => updateText(item.id, { name: e.target.value })}
                      className={adminInputClass()}
                    />
                  </AdminField>
                  <AdminField label={adminRu.cosmetics.volume}>
                    <input
                      value={texts.volume ?? ""}
                      onChange={(e) => updateText(item.id, { volume: e.target.value })}
                      placeholder="50 ml"
                      className={adminInputClass()}
                    />
                  </AdminField>
                  <div className="sm:col-span-2">
                    <AdminField label={adminRu.cosmetics.description}>
                      <textarea
                        value={texts.description ?? ""}
                        onChange={(e) => updateText(item.id, { description: e.target.value })}
                        rows={3}
                        className={adminInputClass("resize-y")}
                      />
                    </AdminField>
                  </div>
                  <div className="sm:col-span-2">
                    <AdminField label={adminRu.cosmetics.composition}>
                      <textarea
                        value={texts.composition ?? ""}
                        onChange={(e) => updateText(item.id, { composition: e.target.value })}
                        rows={3}
                        className={adminInputClass("resize-y")}
                      />
                    </AdminField>
                  </div>
                </div>
              </div>
            </AdminPanel>
          );
        })}
      </div>

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar
        dirty={dirty}
        saving={contentSaving}
        onSave={handleSave}
        onDiscard={() => {
          setDraft(cosmetics);
          setTextDraft(defaultTexts);
          setFeaturedDraft(normalizeFeaturedCosmeticIds(featuredCosmeticIds, cosmetics));
          setRetiredDraft(cosmeticRetiredIds);
          setIdPickerOpen(false);
          setFeaturedLimitHint("");
          setDirty(false);
        }}
      />
    </>
  );
}
