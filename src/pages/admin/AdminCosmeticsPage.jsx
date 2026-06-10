import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { getAdminSectionKey } from "../../admin/adminNav";
import { getSectionMeta } from "../../admin/adminSectionMeta";
import { publishCosmeticsLocalesFromRussian } from "../../admin/publishCmsFromRu";
import { CMS_AUTHOR_LANG, localeDefaults } from "../../admin/siteContent";
import {
  LangTabs,
  deriveCosmeticInitials,
  filterAdminList,
  useAdminPersist,
  useRegisterAdminDirty,
} from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import {
  CATEGORY_KEYS,
  generateCosmeticNumericId,
  getProductImageSurfaceClass,
  MAX_FEATURED_COSMETICS,
  normalizeFeaturedCosmeticIds,
  PLACEHOLDER_GRADIENTS,
  usesTransparentProductPhoto,
} from "../../components/CosmeticsSection/cosmeticsShared";
import AdminImageField from "../../admin/AdminImageField";
import { deleteSiteImageByRef, isImageRef } from "../../admin/siteImages";
import {
  AdminButton,
  AdminConfirmDialog,
  AdminField,
  AdminPageHeader,
  AdminPanel,
  AdminEmptyState,
  AdminListSearch,
  AdminSaveBar,
  AdminSearchEmpty,
  AdminStickyCardHeader,
  AdminStatusToast,
  AdminViewSiteButton,
  adminInputClass,
} from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";
import {
  normalizeCosmeticCopy,
  sanitizeCosmeticsProductsDraft,
} from "../../components/CosmeticsSection/cosmeticsShared";

const PRODUCT_CATEGORIES = CATEGORY_KEYS.filter((key) => key !== "all");
const STATUS_TIMEOUT_MS = 4000;

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
  const { contentSaving, saveError, runSave, saveMerged } = useAdminPersist({ showSuccessToast: false });
  const [activeLang, setActiveLang] = useState(CMS_AUTHOR_LANG);
  const [translating, setTranslating] = useState(false);
  const [draft, setDraft] = useState(cosmetics);
  const [textDraft, setTextDraft] = useState({});
  const [featuredDraft, setFeaturedDraft] = useState(featuredCosmeticIds);
  const [retiredDraft, setRetiredDraft] = useState(cosmeticRetiredIds);
  const [dirty, setDirty] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  useRegisterAdminDirty(dirty);
  const [idPickerOpen, setIdPickerOpen] = useState(false);
  const [selectedRetiredId, setSelectedRetiredId] = useState("");
  const [featuredLimitHint, setFeaturedLimitHint] = useState("");
  const [highlightId, setHighlightId] = useState("");
  const [status, setStatus] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const cardRefs = useRef({});

  const ruTexts = useMemo(
    () => buildDefaultTexts(cosmetics, CMS_AUTHOR_LANG, overrides),
    [cosmetics, overrides.locales]
  );

  const previewTexts = useMemo(
    () => buildDefaultTexts(cosmetics, activeLang, overrides),
    [cosmetics, activeLang, overrides.locales]
  );

  const activeIds = useMemo(() => draft.map((item) => item.id), [draft]);

  useEffect(() => {
    setDraft(cosmetics);
    setTextDraft(ruTexts);
    setFeaturedDraft(normalizeFeaturedCosmeticIds(featuredCosmeticIds, cosmetics));
    setRetiredDraft(cosmeticRetiredIds);
    setDirty(false);
    setHighlightId("");
  }, [cosmetics, ruTexts, featuredCosmeticIds, cosmeticRetiredIds]);

  useEffect(() => {
    if (!idPickerOpen) return;
    setSelectedRetiredId(retiredDraft[0] ?? "");
  }, [idPickerOpen, retiredDraft]);

  useEffect(() => {
    if (!status) return undefined;
    const timer = window.setTimeout(() => setStatus(null), STATUS_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (!highlightId) return undefined;
    const node = cardRefs.current[highlightId];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    const timer = window.setTimeout(() => setHighlightId(""), 2400);
    return () => window.clearTimeout(timer);
  }, [highlightId, draft]);

  const showStatus = (message, tone = "info") => setStatus({ message, tone });

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
      {
        id,
        category: "oils",
        initials: "NU",
        accent: prev.length % PLACEHOLDER_GRADIENTS.length,
        transparentPhoto: true,
      },
      ...prev,
    ]);
    setTextDraft((prev) => ({ ...prev, [id]: { ...EMPTY_PRODUCT_TEXT } }));

    setFeaturedDraft((prev) => {
      if (prev.includes(id) || prev.length >= MAX_FEATURED_COSMETICS) return prev;
      return [...prev, id];
    });

    setHighlightId(id);
    setDirty(true);
    setIdPickerOpen(false);
    showStatus(adminRu.cosmetics.statusAdded, "success");
  };

  const requestAddProduct = () => {
    if (retiredDraft.length > 0) {
      setIdPickerOpen(true);
      return;
    }
    setConfirm({
      type: "add",
      title: adminRu.cosmetics.confirmAddTitle,
      message: adminRu.cosmetics.confirmAddMessage,
      onConfirm: () => {
        const id = generateCosmeticNumericId(activeIds, retiredDraft);
        addProductToDraft(id);
        setConfirm(null);
      },
    });
  };

  const requestAddWithRetiredId = () => {
    if (!selectedRetiredId) return;
    setConfirm({
      type: "addRetired",
      title: adminRu.cosmetics.confirmRetiredIdTitle,
      message: adminRu.cosmetics.confirmRetiredIdMessage(selectedRetiredId),
      onConfirm: () => {
        addProductToDraft(selectedRetiredId, { fromRetired: true });
        setConfirm(null);
      },
    });
  };

  const requestAddWithNewId = () => {
    setConfirm({
      type: "addNew",
      title: adminRu.cosmetics.confirmNewIdTitle,
      message: adminRu.cosmetics.confirmNewIdMessage,
      onConfirm: () => {
        const id = generateCosmeticNumericId(activeIds, retiredDraft);
        addProductToDraft(id);
        setConfirm(null);
      },
    });
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
    showStatus(adminRu.cosmetics.statusDeleted, "success");
  };

  const requestRemoveItem = (index) => {
    const item = draft[index];
    if (!item) return;
    const texts = textDraft[item.id] ?? EMPTY_PRODUCT_TEXT;
    const name = texts.name?.trim() || adminRu.cosmetics.newProduct;
    setConfirm({
      type: "delete",
      title: adminRu.cosmetics.confirmDeleteTitle,
      message: adminRu.cosmetics.confirmDeleteMessage(name, item.id),
      variant: "danger",
      confirmLabel: adminRu.common.delete,
      onConfirm: async () => {
        setConfirm(null);
        await removeItem(index);
      },
    });
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
    const ruProducts = sanitizeCosmeticsProductsDraft(textDraft);

    setTranslating(true);
    showStatus(adminRu.cosmetics.statusTranslating, "info");

    const ok = await runSave(async () =>
      saveMerged(async (current) => {
        let next = {
          ...current,
          cosmetics: enriched,
          featuredCosmeticIds: normalizeFeaturedCosmeticIds(featuredDraft, enriched),
          cosmeticRetiredIds: retiredDraft.filter((id) => !enriched.some((item) => item.id === id)),
        };
        return publishCosmeticsLocalesFromRussian(next, ruProducts);
      }, "cosmetics")
    );

    setTranslating(false);
    if (ok) {
      setDirty(false);
      showStatus(adminRu.cosmetics.statusSaved, "success");
    }
  };

  const isAuthoring = activeLang === CMS_AUTHOR_LANG;
  const filteredDraft = filterAdminList(draft, searchQuery, (item) => {
    const texts = textDraft[item.id] ?? EMPTY_PRODUCT_TEXT;
    return `${item.id} ${texts.name ?? ""} ${item.category ?? ""}`;
  });
  const sectionSavedAt = getSectionMeta(overrides, getAdminSectionKey("/admin/cosmetics"));

  return (
    <>
      <AdminStatusToast message={status?.message} tone={status?.tone} />

      <AdminConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        variant={confirm?.variant ?? "primary"}
        confirmLabel={confirm?.confirmLabel}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />

      <AdminPageHeader
        title={adminRu.nav.cosmetics}
        description={adminRu.cosmetics.description}
        sectionSavedAt={sectionSavedAt}
        actions={
          <AdminButton onClick={requestAddProduct}>
            <Plus className="mr-1 h-3.5 w-3.5" /> {adminRu.cosmetics.addProduct}
          </AdminButton>
        }
      />

      <LangTabs activeLang={activeLang} onChange={setActiveLang} />
      <p className="mb-4 text-sm text-stone">
        {isAuthoring ? adminRu.cosmetics.authoringHint : adminRu.cosmetics.previewHint}
      </p>

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
            <AdminButton onClick={requestAddWithRetiredId}>{adminRu.cosmetics.useRetiredId}</AdminButton>
            <AdminButton variant="secondary" onClick={requestAddWithNewId}>
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

      <AdminListSearch value={searchQuery} onChange={setSearchQuery} />

      {draft.length === 0 ? (
        <AdminEmptyState />
      ) : filteredDraft.length === 0 ? (
        <AdminSearchEmpty />
      ) : (
      <div className="space-y-4">
        {filteredDraft.map((item) => {
          const index = draft.findIndex((entry) => entry.id === item.id);
          const texts = (isAuthoring ? textDraft : previewTexts)[item.id] ?? EMPTY_PRODUCT_TEXT;
          const isFeatured = featuredDraft.includes(item.id);
          const isHighlighted = highlightId === item.id;
          return (
            <AdminPanel
              key={item.id}
              ref={(node) => {
                cardRefs.current[item.id] = node;
              }}
              className={isHighlighted ? "border-gold/50 ring-1 ring-gold/30" : ""}
            >
              <AdminStickyCardHeader>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg text-milk">
                      {texts.name?.trim() || adminRu.cosmetics.newProduct}
                    </p>
                    {isHighlighted ? (
                      <span className="rounded-pill border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gold">
                        {adminRu.cosmetics.newProductBadge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">
                    {adminRu.cosmetics.productId}: {item.id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <AdminViewSiteButton href={`/katalog/${item.id}`} />
                  <AdminButton
                    variant="danger"
                    onClick={() => requestRemoveItem(index)}
                    aria-label={adminRu.common.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </AdminButton>
                </div>
              </AdminStickyCardHeader>

              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                {adminRu.cosmetics.cardSection}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <AdminImageField
                    folder="cosmetics"
                    label={adminRu.cosmetics.photo}
                    value={item.img}
                    previewClassName={`mt-3 flex h-48 w-full max-w-sm items-center justify-center rounded-card p-3 ring-1 ring-border/50 ${getProductImageSurfaceClass(item, { hasImage: Boolean(item.img) })}`}
                    onChange={(img) => updateItem(index, { img: img || undefined })}
                  />
                </div>

                <AdminField label={adminRu.cosmetics.transparentPhoto} help={adminRu.help.transparentPhoto}>
                  <label className="flex min-h-[42px] cursor-pointer items-center gap-3 rounded-card border border-border/50 bg-surface px-3">
                    <input
                      type="checkbox"
                      checked={usesTransparentProductPhoto(item)}
                      onChange={() =>
                        updateItem(index, {
                          transparentPhoto: !usesTransparentProductPhoto(item),
                        })
                      }
                      className="h-4 w-4 accent-gold"
                    />
                    <span className="text-sm text-stone">
                      {usesTransparentProductPhoto(item)
                        ? adminRu.cosmetics.transparentPhotoOn
                        : adminRu.cosmetics.transparentPhotoOff}
                    </span>
                  </label>
                </AdminField>

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

                <AdminField label={adminRu.cosmetics.featured} help={adminRu.help.featuredCosmetics}>
                  <label className="flex min-h-[42px] cursor-pointer items-center gap-3 rounded-card border border-border/50 bg-surface px-3">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={() => toggleFeatured(item.id)}
                      className="h-4 w-4 accent-gold"
                    />
                    <span className="text-sm text-stone">
                      {isFeatured ? adminRu.cosmetics.featuredOn : adminRu.cosmetics.featuredOff}
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
                      readOnly={!isAuthoring}
                      onChange={(e) => isAuthoring && updateText(item.id, { name: e.target.value })}
                      className={adminInputClass(!isAuthoring ? "cursor-default opacity-80" : "")}
                    />
                  </AdminField>
                  <AdminField label={adminRu.cosmetics.volume}>
                    <input
                      value={texts.volume ?? ""}
                      readOnly={!isAuthoring}
                      onChange={(e) => isAuthoring && updateText(item.id, { volume: e.target.value })}
                      placeholder="50 ml"
                      className={adminInputClass(!isAuthoring ? "cursor-default opacity-80" : "")}
                    />
                  </AdminField>
                  <div className="sm:col-span-2">
                    <AdminField label={adminRu.cosmetics.productDescription}>
                      <textarea
                        value={texts.description ?? ""}
                        readOnly={!isAuthoring}
                        onChange={(e) => isAuthoring && updateText(item.id, { description: e.target.value })}
                        rows={3}
                        className={adminInputClass(`resize-y ${!isAuthoring ? "cursor-default opacity-80" : ""}`)}
                      />
                    </AdminField>
                  </div>
                  <div className="sm:col-span-2">
                    <AdminField label={adminRu.cosmetics.composition}>
                      <textarea
                        value={texts.composition ?? ""}
                        readOnly={!isAuthoring}
                        onChange={(e) => isAuthoring && updateText(item.id, { composition: e.target.value })}
                        rows={3}
                        className={adminInputClass(`resize-y ${!isAuthoring ? "cursor-default opacity-80" : ""}`)}
                      />
                    </AdminField>
                  </div>
                </div>
              </div>
            </AdminPanel>
          );
        })}
      </div>
      )}

      {saveError ? (
        <p className="mt-4 text-sm text-red-300" role="alert">
          {saveError}
        </p>
      ) : null}
      <AdminSaveBar
        dirty={dirty}
        saving={contentSaving || translating}
        onSave={handleSave}
        hint={status?.message && !dirty ? status.message : undefined}
        onDiscard={() => {
          setDraft(cosmetics);
          setTextDraft(defaultTexts);
          setFeaturedDraft(normalizeFeaturedCosmeticIds(featuredCosmeticIds, cosmetics));
          setRetiredDraft(cosmeticRetiredIds);
          setIdPickerOpen(false);
          setFeaturedLimitHint("");
          setHighlightId("");
          setDirty(false);
        }}
      />
    </>
  );
}
