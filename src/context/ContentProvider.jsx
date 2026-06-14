import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearOverrides,
  exportContentBundle,
  hasUsableCachedCatalog,
  loadOverrides,
  mergeContent,
  patchLocaleBlock,
  saveOverrides,
} from "../admin/contentStore";
import {
  clearSiteContentInSupabase,
  fetchSiteContentFromSupabase,
  saveSiteContentToSupabase,
} from "../admin/supabaseContent";
import {
  getLocaleDefaults,
  CMS_AUTHOR_LANG,
  localeDefaults,
  mergeLocaleBlock,
  mergeProductTexts,
  mergeServiceTexts,
  mergeTeamMemberTexts,
} from "../admin/siteContent";
import { adminRu } from "../admin/adminStrings";
import { buildFullPublishedOverrides } from "../admin/publishFullContent";
import {
  cleanupOrphanedSiteImages,
  collectImageRefsFromOverrides,
  fetchSiteImagesMap,
  getCachedImageDataUrl,
  isImageRef,
  parseImageRef,
  resolveContentImages,
} from "../admin/siteImages";
import { normalizeCosmeticCopy, normalizeCosmeticsList, getProductImages } from "../components/CosmeticsSection/cosmeticsShared";
import { isSupabaseConfigured } from "../lib/supabase";

const ContentContext = createContext(null);

const CMS_SYNC_TIMEOUT_MS = 6000;
const IMAGE_PREFETCH_BATCH_SIZE = 8;
const IMAGE_PREFETCH_BATCH_DELAY_MS = 40;

export { ContentContext };

export function ContentProvider({ children }) {
  const initialOverrides = useMemo(() => loadOverrides(), []);
  const [overrides, setOverrides] = useState(initialOverrides);
  const [cmsSyncing, setCmsSyncing] = useState(
    () => isSupabaseConfigured && !hasUsableCachedCatalog(initialOverrides),
  );
  const [contentSaving, setContentSaving] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [imageCacheVersion, setImageCacheVersion] = useState(0);

  const content = useMemo(() => mergeContent(overrides), [overrides]);
  const resolvedContent = useMemo(() => resolveContentImages(content, {}), [content]);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let cancelled = false;
    const syncTimer = window.setTimeout(() => {
      if (!cancelled) setCmsSyncing(false);
    }, CMS_SYNC_TIMEOUT_MS);

    fetchSiteContentFromSupabase()
      .then((remote) => {
        if (cancelled) return;
        if (remote?.overrides && Object.keys(remote.overrides).length > 0) {
          setOverrides(remote.overrides);
          saveOverrides(remote.overrides);
          setLastSyncedAt(remote.updatedAt);
        }
        setSyncError(null);
      })
      .catch((error) => {
        if (!cancelled) {
          setSyncError(error.message ?? adminRu.sync.fetchFailed);
        }
      })
      .finally(() => {
        if (!cancelled) setCmsSyncing(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(syncTimer);
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    const seen = new Set();
    const missing = [];

    const pushMissingId = (value) => {
      const id = parseImageRef(value);
      if (!id || seen.has(id) || getCachedImageDataUrl(id)) return;
      seen.add(id);
      missing.push(id);
    };

    normalizeCosmeticsList(content.cosmetics).forEach((product) => {
      getProductImages(product).forEach(pushMissingId);
    });

    collectImageRefsFromOverrides(overrides).forEach((id) => {
      if (!seen.has(id) && !getCachedImageDataUrl(id)) {
        seen.add(id);
        missing.push(id);
      }
    });

    if (!missing.length) return undefined;

    let cancelled = false;

    void (async () => {
      for (let index = 0; index < missing.length; index += IMAGE_PREFETCH_BATCH_SIZE) {
        if (cancelled) return;

        const batch = missing.slice(index, index + IMAGE_PREFETCH_BATCH_SIZE);
        try {
          await fetchSiteImagesMap(batch);
        } catch {
          // keep loading remaining batches
        }

        if (!cancelled) {
          setImageCacheVersion((version) => version + 1);
        }

        if (index + IMAGE_PREFETCH_BATCH_SIZE < missing.length && !cancelled) {
          await new Promise((resolve) => {
            window.setTimeout(resolve, IMAGE_PREFETCH_BATCH_DELAY_MS);
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [overrides, content.cosmetics]);

  const persistOverrides = useCallback(async (next) => {
    setOverrides(next);
    saveOverrides(next);

    if (!isSupabaseConfigured) return;

    setContentSaving(true);
    try {
      const updatedAt = await saveSiteContentToSupabase(next);
      await cleanupOrphanedSiteImages(next);
      setLastSyncedAt(updatedAt);
      setSyncError(null);
    } catch (error) {
      setSyncError(error.message ?? adminRu.sync.saveFailed);
      throw error;
    } finally {
      setContentSaving(false);
    }
  }, []);

  const saveOverridesBundle = useCallback(
    (next) => persistOverrides(next),
    [persistOverrides]
  );

  const updateSection = useCallback(
    (key, value) => persistOverrides({ ...overrides, [key]: value }),
    [overrides, persistOverrides]
  );

  const updateLocaleBlock = useCallback(
    (lang, block, value) => persistOverrides(patchLocaleBlock(overrides, lang, block, value)),
    [overrides, persistOverrides]
  );

  const resetContent = useCallback(async () => {
    clearOverrides();
    setOverrides({});

    if (!isSupabaseConfigured) return;

    setContentSaving(true);
    try {
      await clearSiteContentInSupabase();
      await cleanupOrphanedSiteImages({});
      setLastSyncedAt(new Date().toISOString());
      setSyncError(null);
    } catch (error) {
      setSyncError(error.message ?? adminRu.sync.clearFailed);
      throw error;
    } finally {
      setContentSaving(false);
    }
  }, []);

  const exportContent = useCallback(() => exportContentBundle(overrides), [overrides]);

  const importContent = useCallback(
    async (raw) => {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      const next = parsed.overrides ?? parsed;
      await persistOverrides(next);
      return mergeContent(next);
    },
    [persistOverrides]
  );

  const publishFullSnapshot = useCallback(async () => {
    const next = buildFullPublishedOverrides(overrides);
    await persistOverrides(next);
    return mergeContent(next);
  }, [overrides, persistOverrides]);

  const getFaqItems = useCallback(
    (lang, fallback = []) => {
      const items = overrides.faq?.[lang];
      if (Array.isArray(items) && items.length) return items;
      return fallback;
    },
    [overrides.faq]
  );

  const getLocaleSection = useCallback(
    (lang, block, fallback) => mergeLocaleBlock(lang, block, overrides, fallback ?? getLocaleDefaults(lang, block)),
    [overrides]
  );

  const getHeroSlides = useCallback(
    (lang, fallback = []) => getLocaleSection(lang, "announcements", { items: fallback }).items ?? fallback,
    [getLocaleSection]
  );

  const getHomeNews = useCallback(
    (lang, fallback = { sectionLabel: "", items: [] }) => {
      const block = getLocaleSection(lang, "homeNews", fallback);
      const items = (block.items ?? [])
        .filter((item) => item?.active !== false && item?.title?.trim())
        .slice(0, 5);
      return {
        sectionLabel: block.sectionLabel ?? fallback.sectionLabel ?? "",
        items,
      };
    },
    [getLocaleSection]
  );

  const getAboutContent = useCallback(
    (lang, fallback) => ({
      ...(fallback ?? getLocaleDefaults(lang, "about")),
      ...getLocaleSection(lang, "about", fallback),
      image: resolvedContent.aboutImage,
    }),
    [resolvedContent.aboutImage, getLocaleSection]
  );

  const getServiceTexts = useCallback(
    (lang, slug, t) => {
      const fallback = {
        title: t(`servicesItems.${slug}.title`),
        desc: t(`servicesItems.${slug}.desc`),
        seoTitle: t(`servicesItems.${slug}.seoTitle`),
        seoDescription: t(`servicesItems.${slug}.seoDescription`),
      };
      return mergeServiceTexts(lang, slug, overrides, fallback);
    },
    [overrides]
  );

  const getProductTexts = useCallback(
    (lang, productId, t) => {
      const bundle = localeDefaults[lang]?.cosmetics?.products?.[productId] ?? {};
      const fallback = normalizeCosmeticCopy({
        name: bundle.name ?? t(`cosmetics.products.${productId}.name`),
        description: bundle.description ?? t(`cosmetics.products.${productId}.description`),
        volume: bundle.volume ?? t(`cosmetics.products.${productId}.volume`),
        composition: bundle.composition ?? t(`cosmetics.products.${productId}.composition`),
        tagline: bundle.tagline ?? t(`cosmetics.products.${productId}.tagline`),
        brand: bundle.brand ?? t(`cosmetics.products.${productId}.brand`),
      });
      const merged = normalizeCosmeticCopy(
        mergeProductTexts(lang, productId, overrides, fallback),
      );
      const authorName =
        overrides?.locales?.[CMS_AUTHOR_LANG]?.cosmetics?.products?.[productId]?.name?.trim() ||
        overrides?.locales?.ru?.cosmetics?.products?.[productId]?.name?.trim();
      if (authorName) {
        merged.name = authorName;
      } else if (!merged.name?.trim()) {
        for (const locale of ["uk", "pl", "en", "ru"]) {
          const name = overrides?.locales?.[locale]?.cosmetics?.products?.[productId]?.name?.trim();
          if (name) {
            merged.name = name;
            break;
          }
        }
      }
      return merged;
    },
    [overrides],
  );

  const getTeamMemberContent = useCallback(
    (lang, member, t) => {
      const roleKey = member.role === "topMaster" ? "team.roles.topMaster" : "team.roles.master";
      const fallback = {
        bio: t(`team.members.${member.id}.bio`),
        specialties: t(`team.members.${member.id}.specialties`) ?? [],
        roleLabel: t(roleKey),
      };
      const merged = mergeTeamMemberTexts(lang, member.id, overrides, fallback);
      return { ...member, ...merged, roleKey };
    },
    [overrides]
  );

  const getImageDataUrl = useCallback(
    (value) => {
      if (!value || typeof value !== "string") return value ?? "";
      if (!isImageRef(value)) return value;
      const id = parseImageRef(value);
      if (!id) return "";
      return getCachedImageDataUrl(id) ?? "";
    },
    [],
  );

  const value = useMemo(
    () => ({
      ...resolvedContent,
      cosmetics: normalizeCosmeticsList(resolvedContent.cosmetics),
      overrides,
      contentLoading: cmsSyncing && !hasUsableCachedCatalog(overrides),
      cmsSyncing,
      contentSaving,
      syncError,
      lastSyncedAt,
      isSupabaseEnabled: isSupabaseConfigured,
      imageCacheVersion,
      getImageDataUrl,
      saveOverridesBundle,
      updateSection,
      updateLocaleBlock,
      resetContent,
      exportContent,
      importContent,
      publishFullSnapshot,
      getFaqItems,
      getLocaleSection,
      getHeroSlides,
      getHomeNews,
      getAboutContent,
      getServiceTexts,
      getProductTexts,
      getTeamMemberContent,
      hasOverrides: Object.keys(overrides).length > 0,
      sectionMeta: overrides._adminMeta?.sections ?? {},
    }),
    [
      resolvedContent,
      overrides,
      cmsSyncing,
      contentSaving,
      syncError,
      lastSyncedAt,
      imageCacheVersion,
      getImageDataUrl,
      saveOverridesBundle,
      updateSection,
      updateLocaleBlock,
      resetContent,
      exportContent,
      importContent,
      publishFullSnapshot,
      getFaqItems,
      getLocaleSection,
      getHeroSlides,
      getHomeNews,
      getAboutContent,
      getServiceTexts,
      getProductTexts,
      getTeamMemberContent,
    ]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}
