import { useEffect, useMemo, useState } from "react";
import { localeDefaults } from "../../admin/siteContent";
import { LangTabs, useAdminPersist } from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import AdminImageField from "../../admin/AdminImageField";
import { AdminField, AdminPageHeader, AdminPanel, AdminSaveBar, adminInputClass } from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

export default function AdminServicesPage() {
  const { services, overrides, isSupabaseEnabled } = useContent();
  const { contentSaving, saveError, runSave, saveMerged, patchLocaleBlock } = useAdminPersist();
  const [activeLang, setActiveLang] = useState("pl");
  const [imgDraft, setImgDraft] = useState({});
  const [textDraft, setTextDraft] = useState({});
  const [dirty, setDirty] = useState(false);

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
    services.forEach((service) => {
      imgs[service.slug] = service.img;
    });
    setImgDraft(imgs);
    setTextDraft(defaultTexts);
    setDirty(false);
  }, [services, defaultTexts]);

  const updateImg = (slug, img) => {
    setImgDraft((prev) => ({ ...prev, [slug]: img }));
    setDirty(true);
  };

  const updateText = (slug, patch) => {
    setTextDraft((prev) => ({ ...prev, [slug]: { ...prev[slug], ...patch } }));
    setDirty(true);
  };

  const handleSave = async () => {
    const ok = await runSave(() =>
      saveMerged((current) => {
        const baseServices = Array.isArray(current.services) ? current.services : services;
        const mergedServices = baseServices.map((service) => ({
          ...service,
          img: imgDraft[service.slug] ?? service.img,
        }));
        const next = { ...current, services: mergedServices };
        return patchLocaleBlock(next, activeLang, "servicesItems", textDraft);
      })
    );
    if (ok) setDirty(false);
  };

  const handleDiscard = () => {
    const imgs = {};
    services.forEach((service) => {
      imgs[service.slug] = service.img;
    });
    setImgDraft(imgs);
    setTextDraft(defaultTexts);
    setDirty(false);
  };

  return (
    <>
      <AdminPageHeader
        title={adminRu.nav.services}
        description="Фото и тексты услуг. Цены и длительности задаются в CRM и обновляются на сайте автоматически."
      />

      {!isSupabaseEnabled && (
        <p className="mb-4 text-sm text-red-300">
          Supabase не настроен — изменения сохраняются только локально.
        </p>
      )}

      <LangTabs activeLang={activeLang} onChange={setActiveLang} />

      <div className="space-y-4">
        {services.map((service) => {
          const texts = textDraft[service.slug] ?? {};
          const priceLabel = service.price?.length
            ? service.price.map((p, i) => `${service.time?.[i] ?? "?"} мин — ${p} zł`).join(", ")
            : "—";

          return (
            <AdminPanel key={service.slug}>
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <AdminField label={adminRu.common.slug}>
                  <input value={service.slug} readOnly className={adminInputClass("opacity-60")} />
                </AdminField>
                <AdminField label="Цены из CRM (только просмотр)">
                  <input value={priceLabel} readOnly className={adminInputClass("opacity-60")} />
                </AdminField>
                <div className="sm:col-span-2">
                  <AdminImageField
                    folder="services"
                    label={adminRu.common.imageUrl}
                    value={imgDraft[service.slug] ?? service.img}
                    onChange={(img) => updateImg(service.slug, img)}
                  />
                </div>
                <div className="sm:col-span-2 border-t border-border/20 pt-4">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                    {adminRu.common.texts} · {activeLang.toUpperCase()}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <AdminField label={adminRu.common.name}>
                      <input
                        value={texts.title ?? ""}
                        onChange={(e) => updateText(service.slug, { title: e.target.value })}
                        className={adminInputClass()}
                      />
                    </AdminField>
                    <div className="sm:col-span-2">
                      <AdminField label={adminRu.common.description}>
                        <textarea
                          value={texts.desc ?? ""}
                          onChange={(e) => updateText(service.slug, { desc: e.target.value })}
                          rows={3}
                          className={adminInputClass("resize-y")}
                        />
                      </AdminField>
                    </div>
                  </div>
                </div>
              </div>
            </AdminPanel>
          );
        })}
      </div>

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={dirty} saving={contentSaving} onSave={handleSave} onDiscard={handleDiscard} />
    </>
  );
}
