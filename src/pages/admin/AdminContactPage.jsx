import { useMemo, useState } from "react";
import { getLocaleDefaults } from "../../admin/siteContent";
import { LangTabs, useAdminDraft, useAdminPersist, useRegisterAdminDirty } from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import { AdminField, AdminPageHeader, AdminPanel, AdminSaveBar, adminInputClass } from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

export default function AdminContactPage() {
  const { contact, overrides, getLocaleSection } = useContent();
  const { contentSaving, saveError, runSave, saveMerged, patchLocaleBlock } = useAdminPersist();
  const [activeLang, setActiveLang] = useState("pl");

  const localeSource = useMemo(
    () => getLocaleSection(activeLang, "visit", getLocaleDefaults(activeLang, "visit")),
    [activeLang, getLocaleSection, overrides.locales]
  );

  const { draft: contactDraft, setDraft: setContactDraft, dirty: contactDirty, reset: resetContact } = useAdminDraft(contact);
  const { draft: visitDraft, setDraft: setVisitDraft, dirty: visitDirty, reset: resetVisit } = useAdminDraft(localeSource);
  useRegisterAdminDirty(contactDirty || visitDirty);

  const patchContact = (key, value) => setContactDraft((prev) => ({ ...prev, [key]: value }));
  const patchVisit = (key, value) => setVisitDraft((prev) => ({ ...prev, [key]: value }));
  const updateStep = (index, patch) => {
    setVisitDraft((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) => (i === index ? { ...step, ...patch } : step)),
    }));
  };

  const handleSave = async () => {
    const ok = await runSave(() =>
      saveMerged((current) => {
        const next = { ...current, contact: contactDraft };
        return patchLocaleBlock(next, activeLang, "visit", visitDraft);
      })
    );
    if (ok) {
      resetContact();
      resetVisit();
    }
  };

  return (
    <>
      <AdminPageHeader title="Контакты и локация" description="Адрес, телефон, карта и тексты секции визита." />

      <AdminPanel className="mb-6 grid gap-4 sm:grid-cols-2">
        <AdminField label={adminRu.common.street}><input value={contactDraft.street} onChange={(e) => patchContact("street", e.target.value)} className={adminInputClass()} /></AdminField>
        <AdminField label={adminRu.common.city}><input value={contactDraft.city} onChange={(e) => patchContact("city", e.target.value)} className={adminInputClass()} /></AdminField>
        <AdminField label={adminRu.common.phoneLink}><input value={contactDraft.phone} onChange={(e) => patchContact("phone", e.target.value)} className={adminInputClass()} /></AdminField>
        <AdminField label={adminRu.common.phoneDisplay}><input value={contactDraft.phoneDisplay} onChange={(e) => patchContact("phoneDisplay", e.target.value)} className={adminInputClass()} /></AdminField>
        <AdminField label={adminRu.common.email}><input value={contactDraft.email} onChange={(e) => patchContact("email", e.target.value)} className={adminInputClass()} /></AdminField>
        <AdminField label={adminRu.common.booksyLink}><input value={contactDraft.booksyUrl} onChange={(e) => patchContact("booksyUrl", e.target.value)} className={adminInputClass()} /></AdminField>
        <AdminField label={adminRu.common.lat}><input type="number" step="any" value={contactDraft.lat} onChange={(e) => patchContact("lat", Number(e.target.value))} className={adminInputClass()} /></AdminField>
        <AdminField label={adminRu.common.lng}><input type="number" step="any" value={contactDraft.lng} onChange={(e) => patchContact("lng", Number(e.target.value))} className={adminInputClass()} /></AdminField>
        <div className="sm:col-span-2">
          <AdminField label={adminRu.common.mapsLink}><input value={contactDraft.mapsLink} onChange={(e) => patchContact("mapsLink", e.target.value)} className={adminInputClass()} /></AdminField>
        </div>
      </AdminPanel>

      <LangTabs activeLang={activeLang} onChange={setActiveLang} />

      <AdminPanel className="mb-4 grid gap-4">
        <AdminField label={adminRu.common.label}><input value={visitDraft.label ?? ""} onChange={(e) => patchVisit("label", e.target.value)} className={adminInputClass()} /></AdminField>
        <AdminField label={adminRu.common.title}><input value={visitDraft.title ?? ""} onChange={(e) => patchVisit("title", e.target.value)} className={adminInputClass()} /></AdminField>
        <AdminField label={adminRu.common.description}><textarea value={visitDraft.description ?? ""} onChange={(e) => patchVisit("description", e.target.value)} rows={2} className={adminInputClass("resize-y")} /></AdminField>
        <AdminField label={adminRu.common.metro}><input value={visitDraft.metro ?? ""} onChange={(e) => patchVisit("metro", e.target.value)} className={adminInputClass()} /></AdminField>
      </AdminPanel>

      <div className="space-y-4">
        {(visitDraft.steps ?? []).map((step, index) => (
          <AdminPanel key={step.id ?? index}>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-muted">{adminRu.common.step} {index + 1}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label={adminRu.common.title}><input value={step.title} onChange={(e) => updateStep(index, { title: e.target.value })} className={adminInputClass()} /></AdminField>
              <AdminField label={adminRu.common.iconId}><input value={step.id} onChange={(e) => updateStep(index, { id: e.target.value })} className={adminInputClass()} /></AdminField>
              <div className="sm:col-span-2">
                <AdminField label={adminRu.common.description}><textarea value={step.description} onChange={(e) => updateStep(index, { description: e.target.value })} rows={2} className={adminInputClass("resize-y")} /></AdminField>
              </div>
            </div>
          </AdminPanel>
        ))}
      </div>

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={contactDirty || visitDirty} saving={contentSaving} onSave={handleSave} onDiscard={() => { resetContact(); resetVisit(); }} />
    </>
  );
}
