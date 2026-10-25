import { useEffect, useMemo, useState } from "react";
import { Check, Image as ImageIcon, Languages, Search, Sparkles } from "lucide-react";
import { localeDefaults } from "../../admin/siteContent";
import { getAdminSectionKey } from "../../admin/adminNav";
import { filterAdminList, LangTabs, useAdminPersist, useRegisterAdminDirty } from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import AdminImageField from "../../admin/AdminImageField";
import { AdminField, AdminPanel, AdminSaveBar, AdminViewSiteButton, adminInputClass } from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

export default function AdminServicesPage() {
  const { services, rawContent, overrides, isSupabaseEnabled } = useContent();
  const { contentSaving, saveError, runSave, savePatch } = useAdminPersist();
  const [activeLang, setActiveLang] = useState("pl");
  const [imgDraft, setImgDraft] = useState({});
  const [textDraft, setTextDraft] = useState({});
  const [dirty, setDirty] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(services[0]?.slug ?? "");
  useRegisterAdminDirty(dirty);

  const sourceServices = useMemo(() => {
    const rawServices = rawContent?.services;
    return Array.isArray(rawServices) && rawServices.length ? rawServices : services;
  }, [rawContent?.services, services]);

  const defaultTexts = useMemo(() => {
    const items = {};
    services.forEach((service) => {
      const base = localeDefaults[activeLang]?.servicesItems?.[service.slug] ?? {};
      const override = overrides.locales?.[activeLang]?.servicesItems?.[service.slug] ?? {};
      items[service.slug] = { ...base, ...override };
    });
    return items;
  }, [services, activeLang, overrides.locales]);

  useEffect(() => {
    const imgs = {};
    sourceServices.forEach((service) => {
      imgs[service.slug] = service.img;
    });
    setImgDraft(imgs);
    setTextDraft(defaultTexts);
    setDirty(false);
  }, [sourceServices, defaultTexts]);

  useEffect(() => {
    if (services.some((service) => service.slug === selectedSlug)) return;
    setSelectedSlug(services[0]?.slug ?? "");
  }, [selectedSlug, services]);

  const updateImg = (slug, img) => {
    setImgDraft((prev) => ({ ...prev, [slug]: img }));
    setDirty(true);
  };

  const updateText = (slug, patch) => {
    setTextDraft((prev) => ({ ...prev, [slug]: { ...prev[slug], ...patch } }));
    setDirty(true);
  };

  const handleSave = async () => {
    const imagesChanged = sourceServices.some(
      (service) => (imgDraft[service.slug] ?? service.img ?? "") !== (service.img ?? ""),
    );
    const ok = await runSave(() =>
      savePatch(() => {
        const patch = {
          locales: {
            [activeLang]: {
              servicesItems: textDraft,
            },
          },
        };

        if (imagesChanged) {
          patch.services = sourceServices.map((service) => ({
            ...service,
            img: imgDraft[service.slug] ?? service.img,
          }));
        }

        return patch;
      }, getAdminSectionKey("/admin/services"))
    );
    if (ok) setDirty(false);
  };

  const handleDiscard = () => {
    const imgs = {};
    sourceServices.forEach((service) => {
      imgs[service.slug] = service.img;
    });
    setImgDraft(imgs);
    setTextDraft(defaultTexts);
    setDirty(false);
  };

  const filteredServices = useMemo(
    () => filterAdminList(services, searchQuery, (service) => {
      const texts = textDraft[service.slug] ?? {};
      return `${service.slug} ${texts.title ?? ""} ${texts.desc ?? ""}`;
    }),
    [services, searchQuery, textDraft],
  );

  const selectedService = services.find((service) => service.slug === selectedSlug) ?? filteredServices[0] ?? services[0];
  const selectedSourceService = sourceServices.find((service) => service.slug === selectedService?.slug) ?? selectedService;
  const selectedTexts = textDraft[selectedService?.slug] ?? {};
  const priceLabel = selectedService?.price?.length
    ? selectedService.price.map((price, index) => `${selectedService.time?.[index] ?? "?"} мин — ${price} zł`).join(", ")
    : "—";

  return (
    <>
      {!isSupabaseEnabled && (
        <p className="mb-3 text-xs text-red-300">
          CRM backend не настроен — изменения сохраняются только локально.
        </p>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-3 border-b border-border/40 pb-3">
        <div className="mr-auto flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" aria-hidden />
          <h2 className="text-base font-semibold text-milk">Услуги</h2>
          <span className="rounded-pill bg-card px-2 py-0.5 text-[11px] font-semibold text-muted">{services.length}</span>
        </div>
        {dirty ? <span className="hidden text-xs text-gold xl:inline">Сначала сохраните изменения</span> : null}
        <LangTabs
          activeLang={activeLang}
          onChange={setActiveLang}
          disabled={dirty || contentSaving}
          className="order-3 w-full sm:order-none sm:w-auto"
        />
        <AdminViewSiteButton href="/#services" />
      </div>

      <div className="grid items-start gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
        <AdminPanel className="overflow-hidden p-0 sm:p-0 lg:sticky lg:top-3">
          <div className="border-b border-border/40 p-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Найти услугу"
                className={adminInputClass("pl-10")}
              />
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto p-2 lg:max-h-[calc(100vh-170px)] lg:flex-col lg:overflow-y-auto">
            {filteredServices.map((service) => {
              const texts = textDraft[service.slug] ?? {};
              const active = selectedService?.slug === service.slug;
              return (
                <button
                  key={service.slug}
                  type="button"
                  onClick={() => setSelectedSlug(service.slug)}
                  className={`min-w-[190px] rounded-card border px-3 py-2.5 text-left transition lg:min-w-0 ${
                    active
                      ? "border-gold/40 bg-gold/10 text-milk"
                      : "border-transparent text-stone hover:border-border/60 hover:bg-surface"
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 text-sm font-semibold">{texts.title || service.slug}</span>
                    {active ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden /> : null}
                  </span>
                  <span className="mt-1 block truncate text-[11px] text-muted">{service.slug}</span>
                </button>
              );
            })}
            {!filteredServices.length ? <p className="p-3 text-sm text-muted">Ничего не найдено</p> : null}
          </div>
        </AdminPanel>

        {selectedService ? (
          <AdminPanel className="p-4 sm:p-4">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border/30 pb-3">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-gold">
                    <Sparkles className="h-4 w-4" aria-hidden />
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em]">Редактор услуги</span>
                  </div>
                  <h3 className="font-display text-xl text-milk">{selectedTexts.title || selectedService.slug}</h3>
                  <p className="mt-1 text-xs text-muted">/{selectedService.slug}</p>
                </div>
                <span className="rounded-pill border border-gold/30 bg-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase text-gold">
                  {activeLang}
                </span>
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(260px,0.8fr)_minmax(360px,1.2fr)]">
                <div className="space-y-4 xl:border-r xl:border-border/30 xl:pr-5">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <AdminField label={adminRu.common.slug}>
                      <input value={selectedService.slug} readOnly className={adminInputClass("opacity-60")} />
                    </AdminField>
                    <AdminField label="Цены из CRM (только просмотр)" help={adminRu.help.crmPrices}>
                      <div className="min-h-[42px] rounded-card border border-border/60 bg-surface px-3 py-2.5 text-sm leading-relaxed text-stone">
                        {priceLabel}
                      </div>
                    </AdminField>
                  </div>
                  <div className="border-t border-border/30 pt-4">
                    <div className="mb-3 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-gold" aria-hidden />
                      <h4 className="text-sm font-semibold text-milk">Фото услуги</h4>
                    </div>
                    <AdminImageField
                      folder="services"
                      label={adminRu.common.imageUrl}
                      value={imgDraft[selectedService.slug] ?? selectedSourceService?.img}
                      onChange={(img) => updateImg(selectedService.slug, img)}
                      previewClassName="h-28 w-28 shrink-0 rounded-card object-cover ring-1 ring-border/50"
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Languages className="h-4 w-4 text-gold" aria-hidden />
                    <h4 className="text-sm font-semibold text-milk">Текст на сайте</h4>
                  </div>
                  <div className="space-y-4">
                    <AdminField label={adminRu.common.name}>
                      <input
                        value={selectedTexts.title ?? ""}
                        onChange={(event) => updateText(selectedService.slug, { title: event.target.value })}
                        className={adminInputClass()}
                      />
                    </AdminField>
                    <AdminField label={adminRu.common.description} hint={`${String(selectedTexts.desc ?? "").length} символов`}>
                      <textarea
                        value={selectedTexts.desc ?? ""}
                        onChange={(event) => updateText(selectedService.slug, { desc: event.target.value })}
                        rows={9}
                        className={adminInputClass("min-h-[230px] resize-y leading-relaxed")}
                      />
                    </AdminField>
                  </div>
                </div>
              </div>
          </AdminPanel>
        ) : null}
      </div>

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={dirty} saving={contentSaving} onSave={handleSave} onDiscard={handleDiscard} />
    </>
  );
}
