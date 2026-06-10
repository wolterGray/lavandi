import { useMemo, useState } from "react";
import { getLocaleDefaults } from "../../admin/siteContent";
import { LangTabs, useAdminDraft, useAdminPersist, useRegisterAdminDirty } from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import AdminImageField from "../../admin/AdminImageField";
import { AdminField, AdminPageHeader, AdminPanel, AdminSaveBar, adminInputClass } from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

export default function AdminAboutPage() {
  const { aboutImage, overrides, getLocaleSection } = useContent();
  const { contentSaving, saveError, runSave, saveMerged, patchLocaleBlock } = useAdminPersist();
  const [activeLang, setActiveLang] = useState("pl");

  const source = useMemo(
    () => getLocaleSection(activeLang, "about", getLocaleDefaults(activeLang, "about")),
    [activeLang, getLocaleSection, overrides.locales]
  );

  const { draft, setDraft, dirty, reset } = useAdminDraft(source);
  const { draft: imageDraft, setDraft: setImageDraft, dirty: imageDirty, reset: resetImage } = useAdminDraft(aboutImage);
  useRegisterAdminDirty(dirty || imageDirty);

  const patch = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    const ok = await runSave(() =>
      saveMerged((current) => {
        let next = patchLocaleBlock(current, activeLang, "about", draft);
        if (imageDirty) next = { ...next, aboutImage: imageDraft };
        return next;
      })
    );
    if (ok) {
      reset();
      resetImage();
    }
  };

  return (
    <>
      <AdminPageHeader title={adminRu.nav.about} description="Секция «О нас» — тексты и фото справа." />

      <AdminPanel className="mb-6">
        <AdminImageField
          folder="about"
          label={adminRu.common.sectionImage}
          previewClassName="h-40 w-full max-w-sm rounded-card object-cover ring-1 ring-border/50"
          value={imageDraft}
          onChange={setImageDraft}
        />
      </AdminPanel>

      <LangTabs activeLang={activeLang} onChange={setActiveLang} />

      <AdminPanel className="grid gap-4">
        <AdminField label={adminRu.common.label}>
          <input value={draft.label ?? ""} onChange={(e) => patch("label", e.target.value)} className={adminInputClass()} />
        </AdminField>
        <AdminField label={adminRu.common.title}>
          <input value={draft.title ?? ""} onChange={(e) => patch("title", e.target.value)} className={adminInputClass()} />
        </AdminField>
        <AdminField label={adminRu.common.text}>
          <textarea value={draft.text ?? ""} onChange={(e) => patch("text", e.target.value)} rows={5} className={adminInputClass("resize-y")} />
        </AdminField>
        <AdminField label={adminRu.common.location}>
          <input value={draft.location ?? ""} onChange={(e) => patch("location", e.target.value)} className={adminInputClass()} />
        </AdminField>
      </AdminPanel>

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={dirty || imageDirty} saving={contentSaving} onSave={handleSave} onDiscard={() => { reset(); resetImage(); }} />
    </>
  );
}
