import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearOverrides,
  exportContentBundle,
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
  mergeLocaleBlock,
  mergeProductTexts,
  mergeServiceTexts,
  mergeTeamMemberTexts,
} from "../admin/siteContent";
import { adminRu } from "../admin/adminStrings";
import { buildFullPublishedOverrides } from "../admin/publishFullContent";
import {
  collectImageRefsFromOverrides,
  fetchSiteImagesMap,
  resolveContentImages,
} from "../admin/siteImages";
import { isSupabaseConfigured } from "../lib/supabase";

const ContentContext = createContext(null);

export function ContentProvider({ children }) {
  const [overrides, setOverrides] = useState(() => loadOverrides());
  const [contentLoading, setContentLoading] = useState(isSupabaseConfigured);
  const [contentSaving, setContentSaving] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [imageDataUrls, setImageDataUrls] = useState({});
  const [imagesLoading, setImagesLoading] = useState(isSupabaseConfigured);

  const content = useMemo(() => mergeContent(overrides), [overrides]);
  const resolvedContent = useMemo(
    () => resolveContentImages(content, imageDataUrls),
    [content, imageDataUrls],
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const remote = await fetchSiteContentFromSupabase();
        if (cancelled) return;

        if (remote?.overrides && Object.keys(remote.overrides).length > 0) {
          setOverrides(remote.overrides);
          saveOverrides(remote.overrides);
          setLastSyncedAt(remote.updatedAt);
        }
        setSyncError(null);
      } catch (error) {
        if (!cancelled) {
          setSyncError(error.message ?? adminRu.sync.fetchFailed);
        }
      } finally {
        if (!cancelled) setContentLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setImagesLoading(false);
      return undefined;
    }

    const imageIds = collectImageRefsFromOverrides(overrides);
    if (!imageIds.length) {
      setImageDataUrls({});
      setImagesLoading(false);
      return undefined;
    }

    let cancelled = false;
    setImagesLoading(true);

    fetchSiteImagesMap(imageIds)
      .then((map) => {
        if (!cancelled) setImageDataUrls(map);
      })
      .catch(() => {
        if (!cancelled) setImageDataUrls({});
      })
      .finally(() => {
        if (!cancelled) setImagesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [overrides]);

  const persistOverrides = useCallback(async (next) => {
    setOverrides(next);
    saveOverrides(next);

    if (!isSupabaseConfigured) return;

    setContentSaving(true);
    try {
      const updatedAt = await saveSiteContentToSupabase(next);
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
      const fallback = {
        name: t(`cosmetics.products.${productId}.name`),
        brand: t(`cosmetics.products.${productId}.brand`),
        tagline: t(`cosmetics.products.${productId}.tagline`),
      };
      return mergeProductTexts(lang, productId, overrides, fallback);
    },
    [overrides]
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

  const value = useMemo(
    () => ({
      ...resolvedContent,
      overrides,
      contentLoading: contentLoading || imagesLoading,
      contentSaving,
      syncError,
      lastSyncedAt,
      isSupabaseEnabled: isSupabaseConfigured,
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
    }),
    [
      resolvedContent,
      overrides,
      contentLoading,
      imagesLoading,
      contentSaving,
      syncError,
      lastSyncedAt,
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
