import { useEffect, useMemo, useState } from "react";
import { localeDefaults } from "../../admin/siteContent";
import { syncServicesFromCrm } from "../../admin/crmSync";
import { LangTabs, useAdminPersist } from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import AdminImageField from "../../admin/AdminImageField";
import { AdminButton, AdminField, AdminPageHeader, AdminPanel, AdminSaveBar, adminInputClass } from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

function parseNumberList(value) {
  return value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((num) => !Number.isNaN(num) && num > 0);
}

export default function AdminServicesPage() {
  const { services, overrides, isSupabaseEnabled } = useContent();
  const { contentSaving, saveError, runSave, saveMerged, patchLocaleBlock, updateSection } = useAdminPersist();
  const [activeLang, setActiveLang] = useState("pl");
  const [draft, setDraft] = useState(services);
  const [textDraft, setTextDraft] = useState({});
  const [dirty, setDirty] = useState(false);
  const [crmMessage, setCrmMessage] = useState("");
  const [crmSyncing, setCrmSyncing] = useState(false);

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
    setDraft(services);
    setTextDraft(defaultTexts);
    setDirty(false);
  }, [services, defaultTexts]);

  const updateService = (index, patch) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    setDirty(true);
  };

  const updateText = (slug, patch) => {
    setTextDraft((prev) => ({ ...prev, [slug]: { ...prev[slug], ...patch } }));
    setDirty(true);
  };

  const handleSave = async () => {
    const ok = await runSave(() =>
      saveMerged((current) => {
        const next = { ...current, services: draft };
        return patchLocaleBlock(next, activeLang, "servicesItems", textDraft);
      })
    );
    if (ok) setDirty(false);
  };

  const handleCrmSync = async () => {
    setCrmSyncing(true);
    setCrmMessage("");

    try {
      const result = await syncServicesFromCrm(draft);
      const ok = await runSave(() => updateSection("services", result.services));
      if (ok) {
        setDraft(result.services);
        setDirty(false);
        setCrmMessage(adminRu.crm.imported(result.matched, result.total));
      }
    } catch (error) {
      setCrmMessage(error.message ?? adminRu.crm.syncFailed);
    } finally {
      setCrmSyncing(false);
    }
  };

  const crmSuccess = crmMessage.startsWith("Импортировано");

  return (
    <>
      <AdminPageHeader
        title={adminRu.nav.services}
        description="Цены, длительности, скидки, фото, а также названия и описания на выбранном языке сайта."
        actions={
          isSupabaseEnabled ? (
            <AdminButton variant="ghost" onClick={handleCrmSync} disabled={crmSyncing || contentSaving}>
              {crmSyncing ? adminRu.crm.importing : adminRu.crm.importFromCrm}
            </AdminButton>
          ) : null
        }
      />

      {crmMessage && (
        <p className={`mb-4 text-sm ${crmSuccess ? "text-gold" : "text-red-300"}`}>
          {crmMessage}
        </p>
      )}

      <LangTabs activeLang={activeLang} onChange={setActiveLang} />

      <div className="space-y-4">
        {draft.map((service, index) => {
          const texts = textDraft[service.slug] ?? {};
          return (
            <AdminPanel key={service.slug}>
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                  <AdminField label={adminRu.common.slug}><input value={service.slug} readOnly className={adminInputClass("opacity-60")} /></AdminField>
                  <div className="sm:col-span-2">
                    <AdminImageField
                      folder="services"
                      label={adminRu.common.imageUrl}
                      value={service.img}
                      onChange={(img) => updateService(index, { img })}
                    />
                  </div>
                  <AdminField label={adminRu.common.discount}><input type="number" min="0" max="100" value={service.discount ?? 0} onChange={(e) => updateService(index, { discount: Number(e.target.value) || 0 })} className={adminInputClass()} /></AdminField>
                  <AdminField label={adminRu.common.duration}><input value={service.time.join(", ")} onChange={(e) => updateService(index, { time: parseNumberList(e.target.value) })} className={adminInputClass()} /></AdminField>
                  <div className="sm:col-span-2">
                    <AdminField label={adminRu.common.prices}><input value={service.price.join(", ")} onChange={(e) => updateService(index, { price: parseNumberList(e.target.value) })} className={adminInputClass()} /></AdminField>
                  </div>
                  <div className="sm:col-span-2 border-t border-border/20 pt-4">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-gold">{adminRu.common.texts} · {activeLang.toUpperCase()}</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <AdminField label={adminRu.common.name}><input value={texts.title ?? ""} onChange={(e) => updateText(service.slug, { title: e.target.value })} className={adminInputClass()} /></AdminField>
                      <div className="sm:col-span-2">
                        <AdminField label={adminRu.common.description}><textarea value={texts.desc ?? ""} onChange={(e) => updateText(service.slug, { desc: e.target.value })} rows={3} className={adminInputClass("resize-y")} /></AdminField>
                      </div>
                    </div>
                  </div>
              </div>
            </AdminPanel>
          );
        })}
      </div>

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={dirty} saving={contentSaving} onSave={handleSave} onDiscard={() => { setDraft(services); setTextDraft(defaultTexts); setDirty(false); }} />
    </>
  );
}
