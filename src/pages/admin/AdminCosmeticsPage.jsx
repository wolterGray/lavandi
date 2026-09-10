import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, ImageIcon, Plus, Star, Trash2 } from "lucide-react";
import { getAdminSectionKey } from "../../admin/adminNav";
import { getSectionMeta } from "../../admin/adminSectionMeta";
import { publishCosmeticsLocalesFromAuthor } from "../../admin/publishCmsFromRu";
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
  buildAuthorProductsDraft,
  formatCosmeticVolume,
  generateCosmeticNumericId,
  getProductCategories,
  getProductImages,
  getProductImageSurfaceClass,
  syncProductImageFields,
  MAX_FEATURED_COSMETICS,
  normalizeCosmeticCopy,
  normalizeFeaturedCosmeticIds,
  parseCosmeticVolume,
  PLACEHOLDER_GRADIENTS,
  usesTransparentProductPhoto,
} from "../../components/CosmeticsSection/cosmeticsShared";
import AdminImageField from "../../admin/AdminImageField";
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

const PRODUCT_CATEGORIES = CATEGORY_KEYS.filter((key) => key !== "all");
const STATUS_TIMEOUT_MS = 4000;

const EMPTY_PRODUCT_TEXT = {
  name: "",
  description: "",
  volume: "",
  composition: "",
};

function isFilled(value) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function getProductHealth(item, texts, isFeatured) {
  const missing = [];
  if (!isFilled(item.img)) missing.push("фото");
  if (!getProductCategories(item).length) missing.push("категория");
  if (!isFilled(texts.name)) missing.push("название");
  if (!isFilled(texts.volume)) missing.push("объём");
  if (!isFilled(texts.description)) missing.push("описание");
  if (!isFilled(texts.composition)) missing.push("состав");

  return {
    isReady: missing.length === 0,
    missing,
    isFeatured,
    imageCount: getProductImages(item).length,
  };
}

function StatusPill({ tone = "neutral", children }) {
  const toneClass =
    tone === "good"
      ? "border-emerald-700/40 bg-emerald-950/35 text-emerald-100"
      : tone === "warn"
        ? "border-amber-700/40 bg-amber-950/35 text-amber-100"
        : tone === "gold"
          ? "border-gold/35 bg-gold/10 text-gold"
          : "border-border/50 bg-surface text-stone";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${toneClass}`}>
      {children}
    </span>
  );
}

function buildDefaultTexts(cosmetics, activeLang, overrides) {
  const products = {};
  cosmetics.forEach((product) => {
    const base = localeDefaults[activeLang]?.cosmetics?.products?.[product.id] ?? {};
    const override =
      overrides.locales?.[activeLang]?.cosmetics?.products?.[product.id] ??
      (activeLang === CMS_AUTHOR_LANG
        ? overrides.locales?.ru?.cosmetics?.products?.[product.id]
        : undefined) ??
      {};
    products[product.id] = normalizeCosmeticCopy({ ...base, ...override });
  });
  return products;
}

const ADMIN_COSMETIC_LANGS = ["uk", "pl", "en"];

export default function AdminCosmeticsPage() {
  const { cosmetics, featuredCosmeticIds, cosmeticRetiredIds, overrides } = useContent();
  const { contentSaving, saveError, runSave, saveMerged } = useAdminPersist({ showSuccessToast: false });
  const [activeLang, setActiveLang] = useState(CMS_AUTHOR_LANG);
  const [draft, setDraft] = useState(cosmetics);
  const [textDraft, setTextDraft] = useState({});
  const [featuredDraft, setFeaturedDraft] = useState(featuredCosmeticIds);
  const [retiredDraft, setRetiredDraft] = useState(cosmeticRetiredIds);
  const [dirty, setDirty] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  useRegisterAdminDirty(dirty);
  const [featuredLimitHint, setFeaturedLimitHint] = useState("");
  const [highlightId, setHighlightId] = useState("");
  const [status, setStatus] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const cardRefs = useRef({});

  useEffect(() => {
    try {
      sessionStorage.removeItem("nuar-admin-draft:/admin/cosmetics");
    } catch {
      // ignore stale draft from older builds
    }
  }, []);

  const authorTexts = useMemo(
    () => buildDefaultTexts(cosmetics, CMS_AUTHOR_LANG, overrides),
    [cosmetics, overrides.locales],
  );

  const previewTexts = useMemo(
    () => buildDefaultTexts(cosmetics, activeLang, overrides),
    [cosmetics, activeLang, overrides.locales],
  );

  useEffect(() => {
    if (dirty) return;
    setDraft(cosmetics);
    setTextDraft(authorTexts);
    setFeaturedDraft(normalizeFeaturedCosmeticIds(featuredCosmeticIds, cosmetics));
    setRetiredDraft(cosmeticRetiredIds);
    setDirty(false);
    setHighlightId("");
  }, [cosmetics, authorTexts, featuredCosmeticIds, cosmeticRetiredIds, dirty]);

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
      [productId]: { ...(prev[productId] ?? EMPTY_PRODUCT_TEXT), ...patch },
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
        categories: ["pro-cosmetics"],
        category: "pro-cosmetics",
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
    showStatus(adminRu.cosmetics.statusAdded, "success");
  };

  const requestAddProduct = () => {
    const id = generateCosmeticNumericId(
      draft.map((item) => item.id),
      retiredDraft,
    );
    addProductToDraft(id);
  };

  const toggleCategory = (index, categoryKey) => {
    setDraft((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const current = getProductCategories(item);
        const hasCategory = current.includes(categoryKey);
        if (hasCategory && current.length === 1) return item;

        const next = hasCategory
          ? current.filter((key) => key !== categoryKey)
          : [...current, categoryKey];

        return {
          ...item,
          categories: next,
          category: next[0],
        };
      })
    );
    setDirty(true);
  };

  const updatePrimaryImage = (index, img) => {
    setDraft((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const rest = getProductImages(item).slice(1).filter((ref) => ref && ref !== img);
        const images = img ? [img, ...rest] : rest;
        return syncProductImageFields({ ...item, img: img || undefined, images });
      }),
    );
    setDirty(true);
  };

  const updateGalleryImage = (index, galleryIndex, img) => {
    setDraft((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const images = [...getProductImages(item)];
        images[galleryIndex] = img || undefined;
        const cleaned = images.filter(Boolean);
        return syncProductImageFields({ ...item, images: cleaned });
      }),
    );
    setDirty(true);
  };

  const removeGalleryImage = async (index, galleryIndex) => {
    const item = draft[index];
    const images = getProductImages(item);

    const next = images.filter((_, imageIndex) => imageIndex !== galleryIndex);
    setDraft((prev) =>
      prev.map((entry, i) =>
        i === index ? syncProductImageFields({ ...entry, images: next }) : entry,
      ),
    );
    setDirty(true);
  };

  const addGalleryImage = (index, img) => {
    if (!img) return;

    setDraft((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const images = [...getProductImages(item), img];
        return syncProductImageFields({ ...item, images });
      }),
    );
    setDirty(true);
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

  const executeSaveCosmetics = async (nextDraft, nextTextDraft, nextFeatured, nextRetired) => {
    const enriched = nextDraft.map((item, index) => {
      const texts = nextTextDraft[item.id] ?? EMPTY_PRODUCT_TEXT;
      const categories = getProductCategories(item);
      return syncProductImageFields({
        ...item,
        categories,
        category: categories[0],
        initials: deriveCosmeticInitials(texts.name),
        accent: item.accent ?? index % PLACEHOLDER_GRADIENTS.length,
      });
    });
    const authorProducts = buildAuthorProductsDraft(nextDraft, nextTextDraft);

    showStatus(adminRu.cosmetics.statusSaving, "info");

    const ok = await runSave(async () =>
      saveMerged(async (current) => {
        return publishCosmeticsLocalesFromAuthor(
          {
            ...current,
            cosmetics: enriched,
            featuredCosmeticIds: normalizeFeaturedCosmeticIds(nextFeatured, enriched),
            cosmeticRetiredIds: nextRetired.filter((id) => !enriched.some((item) => item.id === id)),
          },
          authorProducts,
        );
      }, "cosmetics"),
    );

    if (ok) {
      setDraft(nextDraft);
      setTextDraft(nextTextDraft);
      setFeaturedDraft(nextFeatured);
      setRetiredDraft(nextRetired);
      setDirty(false);
      showStatus(adminRu.cosmetics.statusDeleted, "success");
    }
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
        const nextDraft = draft.filter((_, i) => i !== index);
        const id = item?.id;
        const nextTextDraft = { ...textDraft };
        if (id) delete nextTextDraft[id];
        const nextFeatured = featuredDraft.filter((featuredId) => featuredId !== id);
        const nextRetired = id ? (retiredDraft.includes(id) ? retiredDraft : [...retiredDraft, id]) : retiredDraft;

        await executeSaveCosmetics(nextDraft, nextTextDraft, nextFeatured, nextRetired);
      },
    });
  };

  const handleSave = useCallback(async () => {
    await executeSaveCosmetics(draft, textDraft, featuredDraft, retiredDraft);
  }, [draft, textDraft, featuredDraft, retiredDraft, runSave, saveMerged]);

  const handleDiscard = () => {
    setDraft(cosmetics);
    setTextDraft(authorTexts);
    setFeaturedDraft(normalizeFeaturedCosmeticIds(featuredCosmeticIds, cosmetics));
    setRetiredDraft(cosmeticRetiredIds);
    setFeaturedLimitHint("");
    setHighlightId("");
    setDirty(false);
  };

  const isAuthoring = activeLang === CMS_AUTHOR_LANG;
  const filteredDraft = filterAdminList(draft, searchQuery, (item) => {
    const texts = textDraft[item.id] ?? EMPTY_PRODUCT_TEXT;
    return `${item.id} ${texts.name ?? ""} ${texts.description ?? ""} ${getProductCategories(item).join(" ")}`;
  });
  const sectionSavedAt = getSectionMeta(overrides, getAdminSectionKey("/admin/cosmetics"));
  const catalogStats = useMemo(() => {
    const missingPhoto = draft.filter((item) => !isFilled(item.img)).length;
    const incomplete = draft.filter((item) => {
      const texts = textDraft[item.id] ?? EMPTY_PRODUCT_TEXT;
      return !getProductHealth(item, texts, featuredDraft.includes(item.id)).isReady;
    }).length;

    return {
      total: draft.length,
      featured: featuredDraft.length,
      missingPhoto,
      ready: draft.length - incomplete,
      incomplete,
    };
  }, [draft, featuredDraft, textDraft]);

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
        title={`${adminRu.nav.cosmetics} (Всего: ${draft.length})`}
        description={adminRu.cosmetics.description}
        sectionSavedAt={sectionSavedAt}
        actions={
          <AdminButton onClick={requestAddProduct}>
            <Plus className="mr-1 h-3.5 w-3.5" /> {adminRu.cosmetics.addProduct}
          </AdminButton>
        }
      />

      <LangTabs activeLang={activeLang} onChange={setActiveLang} langs={ADMIN_COSMETIC_LANGS} />
      <p className="mb-4 text-sm text-stone">
        {isAuthoring ? adminRu.cosmetics.authoringHint : adminRu.cosmetics.previewHint}
      </p>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <AdminPanel className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Всего товаров</p>
          <p className="mt-1 font-display text-2xl text-milk">{catalogStats.total}</p>
        </AdminPanel>
        <AdminPanel className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Готовы</p>
          <p className="mt-1 font-display text-2xl text-emerald-100">{catalogStats.ready}</p>
        </AdminPanel>
        <AdminPanel className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Нужно заполнить</p>
          <p className="mt-1 font-display text-2xl text-amber-100">{catalogStats.incomplete}</p>
        </AdminPanel>
        <AdminPanel className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Без фото</p>
          <p className="mt-1 font-display text-2xl text-milk">{catalogStats.missingPhoto}</p>
        </AdminPanel>
        <AdminPanel className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">На главной</p>
          <p className="mt-1 font-display text-2xl text-gold">{catalogStats.featured}/{MAX_FEATURED_COSMETICS}</p>
        </AdminPanel>
      </div>

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
          const health = getProductHealth(item, textDraft[item.id] ?? EMPTY_PRODUCT_TEXT, isFeatured);
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
                      {(textDraft[item.id]?.name ?? texts.name)?.trim() || adminRu.cosmetics.newProduct}
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
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusPill tone={health.isReady ? "good" : "warn"}>
                      {health.isReady ? (
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                      )}
                      {health.isReady ? "готово" : `заполнить: ${health.missing.join(", ")}`}
                    </StatusPill>
                    <StatusPill>
                      <ImageIcon className="h-3.5 w-3.5" aria-hidden />
                      фото: {health.imageCount}
                    </StatusPill>
                    {health.isFeatured ? (
                      <StatusPill tone="gold">
                        <Star className="h-3.5 w-3.5" aria-hidden />
                        главная
                      </StatusPill>
                    ) : null}
                  </div>
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
                    previewClassName={`flex h-24 w-24 shrink-0 items-center justify-center rounded-card p-2 ring-1 ring-border/50 ${getProductImageSurfaceClass(item, { hasImage: Boolean(item.img) })}`}
                    onChange={(img) => updatePrimaryImage(index, img)}
                  />
                </div>

                {getProductImages(item).length > 1 ? (
                  <div className="sm:col-span-2 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                      {adminRu.cosmetics.galleryPhotos}
                    </p>
                    {getProductImages(item).slice(1).map((galleryRef, galleryIndex) => (
                      <div key={`${item.id}-gallery-${galleryIndex + 1}`} className="flex flex-wrap items-end gap-3">
                        <div className="min-w-0 flex-1">
                          <AdminImageField
                            folder="cosmetics"
                            label={`${adminRu.cosmetics.galleryPhoto} ${galleryIndex + 2}`}
                            value={galleryRef}
                            previewClassName={`flex h-20 w-20 shrink-0 items-center justify-center rounded-card p-2 ring-1 ring-border/50 ${getProductImageSurfaceClass(item, { hasImage: Boolean(galleryRef) })}`}
                            onChange={(img) => updateGalleryImage(index, galleryIndex + 1, img)}
                          />
                        </div>
                        <AdminButton variant="danger" onClick={() => removeGalleryImage(index, galleryIndex + 1)}>
                          <Trash2 className="h-4 w-4" />
                        </AdminButton>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="sm:col-span-2">
                  <AdminImageField
                    folder="cosmetics"
                    label={adminRu.cosmetics.addGalleryPhoto}
                    value=""
                    previewClassName={`flex h-20 w-20 shrink-0 items-center justify-center rounded-card p-2 ring-1 ring-border/50 ${getProductImageSurfaceClass(item, { hasImage: false })}`}
                    onChange={(img) => addGalleryImage(index, img)}
                    allowRemove={false}
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

                <div className="sm:col-span-2">
                  <AdminField label={adminRu.cosmetics.category} help={adminRu.help.productCategories}>
                    <div className="flex flex-wrap gap-2 rounded-card border border-border/50 bg-surface p-3">
                      {PRODUCT_CATEGORIES.map((key) => {
                        const checked = getProductCategories(item).includes(key);
                        return (
                          <label
                            key={key}
                            className={`flex cursor-pointer items-center gap-2 rounded-pill border px-3 py-1.5 text-sm transition ${
                              checked
                                ? "border-gold/40 bg-gold/10 text-gold"
                                : "border-border/40 text-stone hover:border-gold/25 hover:text-milk"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCategory(index, key)}
                              className="h-3.5 w-3.5 accent-gold"
                            />
                            <span>{adminRu.cosmetics.categories[key] ?? key}</span>
                          </label>
                        );
                      })}
                    </div>
                  </AdminField>
                </div>

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
                    {(() => {
                      const volumeParts = parseCosmeticVolume(texts.volume ?? "");
                      const setVolumeParts = (next) => {
                        if (!isAuthoring) return;
                        updateText(item.id, {
                          volume: formatCosmeticVolume(next),
                        });
                      };

                      return (
                        <div className="grid grid-cols-[minmax(0,1fr)_88px] gap-2">
                          <input
                            inputMode="decimal"
                            value={volumeParts.amount}
                            readOnly={!isAuthoring}
                            onChange={(e) =>
                              setVolumeParts({
                                amount: e.target.value,
                                unit: volumeParts.unit,
                              })
                            }
                            placeholder="400"
                            className={adminInputClass(!isAuthoring ? "cursor-default opacity-80" : "")}
                          />
                          <select
                            value={volumeParts.unit}
                            disabled={!isAuthoring}
                            onChange={(e) =>
                              setVolumeParts({
                                amount: volumeParts.amount,
                                unit: e.target.value,
                              })
                            }
                            className={adminInputClass(!isAuthoring ? "cursor-default opacity-80" : "")}
                          >
                            <option value="ml">ml</option>
                            <option value="g">g</option>
                          </select>
                        </div>
                      );
                    })()}
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
        saving={contentSaving}
        onSave={handleSave}
        hint={status?.message && !dirty ? status.message : undefined}
        onDiscard={handleDiscard}
      />
    </>
  );
}
