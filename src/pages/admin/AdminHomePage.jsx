import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { getLocaleDefaults } from "../../admin/siteContent";
import {
  LangTabs,
  MAX_HERO_SLIDES,
  MAX_HOME_NEWS,
  createNewsItem,
  moveListItem,
  useAdminDraft,
  useAdminPersist,
} from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import AdminImageField from "../../admin/AdminImageField";
import {
  AdminButton,
  AdminField,
  AdminPageHeader,
  AdminPanel,
  AdminSaveBar,
  AdminTabs,
  AdminToggle,
  adminInputClass,
} from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

export default function AdminHomePage() {
  const { overrides, getLocaleSection } = useContent();
  const { contentSaving, saveError, runSave, saveLocaleBlock } = useAdminPersist();
  const [activeLang, setActiveLang] = useState("pl");
  const [activeTab, setActiveTab] = useState("hero");

  const heroSource = useMemo(
    () => getLocaleSection(activeLang, "announcements", getLocaleDefaults(activeLang, "announcements")),
    [activeLang, getLocaleSection, overrides.locales]
  );

  const newsSource = useMemo(
    () => getLocaleSection(activeLang, "homeNews", getLocaleDefaults(activeLang, "homeNews")),
    [activeLang, getLocaleSection, overrides.locales]
  );

  const { draft: heroDraft, setDraft: setHeroDraft, dirty: heroDirty, reset: resetHero } = useAdminDraft(heroSource);
  const { draft: newsDraft, setDraft: setNewsDraft, dirty: newsDirty, reset: resetNews } = useAdminDraft(newsSource);

  const dirty = activeTab === "hero" ? heroDirty : newsDirty;
  const heroCount = heroDraft.items?.length ?? 0;
  const newsCount = newsDraft.items?.length ?? 0;

  const updateSlide = (index, patch) => {
    setHeroDraft((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const addSlide = () => {
    if (heroCount >= MAX_HERO_SLIDES) return;
    setHeroDraft((prev) => ({
      ...prev,
      items: [...(prev.items ?? []), { img: "/massage/1.webp", title: "", news: "" }],
    }));
  };

  const removeSlide = (index) => {
    setHeroDraft((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const moveSlide = (index, direction) => {
    setHeroDraft((prev) => ({ ...prev, items: moveListItem(prev.items ?? [], index, direction) }));
  };

  const updateNewsItem = (index, patch) => {
    setNewsDraft((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const addNewsItem = () => {
    if (newsCount >= MAX_HOME_NEWS) return;
    setNewsDraft((prev) => ({
      ...prev,
      items: [...(prev.items ?? []), createNewsItem()],
    }));
  };

  const removeNewsItem = (index) => {
    setNewsDraft((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const moveNewsItem = (index, direction) => {
    setNewsDraft((prev) => ({ ...prev, items: moveListItem(prev.items ?? [], index, direction) }));
  };

  const handleSave = async () => {
    const ok = await runSave(() =>
      activeTab === "hero"
        ? saveLocaleBlock(activeLang, "announcements", heroDraft)
        : saveLocaleBlock(activeLang, "homeNews", newsDraft)
    );
    if (ok) {
      if (activeTab === "hero") resetHero();
      else resetNews();
    }
  };

  const handleDiscard = () => {
    if (activeTab === "hero") resetHero();
    else resetNews();
  };

  return (
    <>
      <AdminPageHeader
        title={adminRu.nav.home}
        description={adminRu.home.description}
        actions={
          activeTab === "hero" ? (
            <AdminButton onClick={addSlide} disabled={heroCount >= MAX_HERO_SLIDES}>
              <Plus className="mr-1 h-3.5 w-3.5" /> {adminRu.common.slide}
            </AdminButton>
          ) : (
            <AdminButton onClick={addNewsItem} disabled={newsCount >= MAX_HOME_NEWS}>
              <Plus className="mr-1 h-3.5 w-3.5" /> {adminRu.home.addNews}
            </AdminButton>
          )
        }
      />

      <AdminTabs
        activeId={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "hero", label: adminRu.home.heroTab, count: heroCount },
          { id: "news", label: adminRu.home.newsTab, count: newsCount },
        ]}
      />

      <LangTabs activeLang={activeLang} onChange={setActiveLang} />

      {activeTab === "hero" && (
        <div className="space-y-4">
          <p className="text-xs text-muted">{adminRu.home.heroLimit(MAX_HERO_SLIDES)}</p>
          {(heroDraft.items ?? []).map((slide, index) => (
            <AdminPanel key={`${slide.img}-${index}`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  {adminRu.common.slide} {index + 1}
                </p>
                <div className="flex items-center gap-1">
                  <AdminButton variant="ghost" onClick={() => moveSlide(index, -1)} disabled={index === 0} aria-label="Вверх">
                    <ChevronUp className="h-4 w-4" />
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    onClick={() => moveSlide(index, 1)}
                    disabled={index === heroDraft.items.length - 1}
                    aria-label="Вниз"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </AdminButton>
                  <AdminButton variant="danger" onClick={() => removeSlide(index)} aria-label={adminRu.common.delete}>
                    <Trash2 className="h-4 w-4" />
                  </AdminButton>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminImageField
                  folder="hero"
                  label={adminRu.common.photoUrl}
                  previewClassName="h-28 w-28 rounded-card object-cover ring-1 ring-border/50"
                  value={slide.img}
                  onChange={(img) => updateSlide(index, { img })}
                />
                <AdminField label={adminRu.common.title}>
                  <input
                    value={slide.title}
                    onChange={(e) => updateSlide(index, { title: e.target.value })}
                    className={adminInputClass()}
                  />
                </AdminField>
                <div className="sm:col-span-2">
                  <AdminField label={adminRu.common.description}>
                    <textarea
                      value={slide.news}
                      onChange={(e) => updateSlide(index, { news: e.target.value })}
                      rows={3}
                      className={adminInputClass("resize-y")}
                    />
                  </AdminField>
                </div>
              </div>
            </AdminPanel>
          ))}
        </div>
      )}

      {activeTab === "news" && (
        <div className="space-y-4">
          <AdminPanel>
            <AdminField label={adminRu.home.newsSectionLabel}>
              <input
                value={newsDraft.sectionLabel ?? ""}
                onChange={(e) => setNewsDraft((prev) => ({ ...prev, sectionLabel: e.target.value }))}
                className={adminInputClass()}
              />
            </AdminField>
          </AdminPanel>

          <p className="text-xs text-muted">{adminRu.home.newsLimit(MAX_HOME_NEWS)}</p>

          {(newsDraft.items ?? []).map((item, index) => (
            <AdminPanel key={item.id ?? index}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  {adminRu.home.newsItem} {index + 1}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <AdminToggle
                    checked={item.active !== false}
                    onChange={(active) => updateNewsItem(index, { active })}
                    label={adminRu.home.activeOnSite}
                  />
                  <AdminButton variant="ghost" onClick={() => moveNewsItem(index, -1)} disabled={index === 0}>
                    <ChevronUp className="h-4 w-4" />
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    onClick={() => moveNewsItem(index, 1)}
                    disabled={index === newsDraft.items.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </AdminButton>
                  <AdminButton variant="danger" onClick={() => removeNewsItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </AdminButton>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label={adminRu.common.title}>
                  <input
                    value={item.title ?? ""}
                    onChange={(e) => updateNewsItem(index, { title: e.target.value })}
                    className={adminInputClass()}
                  />
                </AdminField>
                <AdminField label={adminRu.home.newsDate}>
                  <input
                    type="date"
                    value={item.date ?? ""}
                    onChange={(e) => updateNewsItem(index, { date: e.target.value })}
                    className={adminInputClass()}
                  />
                </AdminField>
                <div className="sm:col-span-2">
                  <AdminField label={adminRu.common.description}>
                    <textarea
                      value={item.body ?? ""}
                      onChange={(e) => updateNewsItem(index, { body: e.target.value })}
                      rows={3}
                      className={adminInputClass("resize-y")}
                    />
                  </AdminField>
                </div>
                <AdminField label={adminRu.home.newsLink}>
                  <input
                    value={item.link ?? ""}
                    onChange={(e) => updateNewsItem(index, { link: e.target.value })}
                    placeholder="https://booksy.com/..."
                    className={adminInputClass()}
                  />
                </AdminField>
                <AdminField label={adminRu.home.newsLinkLabel}>
                  <input
                    value={item.linkLabel ?? ""}
                    onChange={(e) => updateNewsItem(index, { linkLabel: e.target.value })}
                    placeholder="Zobacz więcej"
                    className={adminInputClass()}
                  />
                </AdminField>
              </div>
            </AdminPanel>
          ))}
        </div>
      )}

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={dirty} saving={contentSaving} onSave={handleSave} onDiscard={handleDiscard} />
    </>
  );
}
