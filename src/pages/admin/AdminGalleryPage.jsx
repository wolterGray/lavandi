import { useEffect, useState } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { cloneAtIndex, useAdminConfirm, useAdminPersist, useRegisterAdminDirty } from "../../admin/adminHelpers";
import { getAdminSectionKey } from "../../admin/adminNav";
import { getSectionMeta } from "../../admin/adminSectionMeta";
import { adminRu } from "../../admin/adminStrings";
import AdminImageField from "../../admin/AdminImageField";
import { AdminButton, AdminEmptyState, AdminField, AdminPageHeader, AdminPanel, AdminSaveBar, adminInputClass } from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

const ALT_KEYS = ["studio", "ambience", "ritual", "space", "classic", "relax", "signature", "sport", "care"];

export default function AdminGalleryPage() {
  const { gallery, overrides } = useContent();
  const { contentSaving, saveError, runSave, saveSection } = useAdminPersist();
  const [draft, setDraft] = useState(gallery);
  const [dirty, setDirty] = useState(false);
  const requestConfirm = useAdminConfirm();
  useRegisterAdminDirty(dirty);

  useEffect(() => {
    setDraft(gallery);
    setDirty(false);
  }, [gallery]);

  const updateItem = (index, patch) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    setDirty(true);
  };

  const removeItem = async (index) => {
    const ok = await requestConfirm({
      title: adminRu.common.confirmDeleteTitle,
      message: adminRu.common.confirmDeleteMessage,
      variant: "danger",
      confirmLabel: adminRu.common.delete,
    });
    if (!ok) return;
    setDraft((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  };

  const addItem = () => {
    setDraft((prev) => [{ src: "/massage/1.webp", altKey: "studio" }, ...prev]);
    setDirty(true);
  };

  const moveItem = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= draft.length) return;
    setDraft((prev) => {
      const copy = [...prev];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
    setDirty(true);
  };

  const cloneItem = (index) => {
    setDraft((prev) => cloneAtIndex(prev, index));
    setDirty(true);
  };

  const handleSave = async () => {
    const ok = await runSave(() => saveSection("gallery", draft));
    if (ok) setDirty(false);
  };

  return (
    <>
      <AdminPageHeader
        title={adminRu.nav.gallery}
        description="Первое фото — главная плитка (2×2). Alt key соответствует переводам в gallery.items.*"
        sectionSavedAt={getSectionMeta(overrides, getAdminSectionKey("/admin/gallery"))}
        actions={<AdminButton onClick={addItem}><Plus className="mr-1 h-3.5 w-3.5" /> {adminRu.common.add}</AdminButton>}
      />

      {draft.length === 0 ? (
        <AdminEmptyState />
      ) : (
      <div className="space-y-4">
        {draft.map((item, index) => (
          <AdminPanel key={`${item.src}-${index}`}>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <AdminImageField
                  folder="gallery"
                  label={adminRu.common.photoUrl}
                  previewClassName="h-28 w-28 rounded-card object-cover ring-1 ring-border/50"
                  value={item.src}
                  onChange={(src) => updateItem(index, { src })}
                />
                <AdminField label={adminRu.common.altKey} help={adminRu.help.altKey}>
                  <select
                    value={item.altKey}
                    onChange={(event) => updateItem(index, { altKey: event.target.value })}
                    className={adminInputClass()}
                  >
                    {ALT_KEYS.map((key) => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </AdminField>
              </div>
              <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                <AdminButton variant="ghost" onClick={() => moveItem(index, -1)} disabled={index === 0}>↑</AdminButton>
                <AdminButton variant="ghost" onClick={() => moveItem(index, 1)} disabled={index === draft.length - 1}>↓</AdminButton>
                <AdminButton variant="ghost" onClick={() => cloneItem(index)} aria-label={adminRu.common.clone}>
                  <Copy className="h-4 w-4" />
                </AdminButton>
                <AdminButton variant="danger" onClick={() => removeItem(index)} aria-label={adminRu.common.delete}>
                  <Trash2 className="h-4 w-4" />
                </AdminButton>
              </div>
            </div>
          </AdminPanel>
        ))}
      </div>
      )}

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={dirty} saving={contentSaving} onSave={handleSave} onDiscard={() => { setDraft(gallery); setDirty(false); }} />
    </>
  );
}
