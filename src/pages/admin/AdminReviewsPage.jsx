import { Plus, Trash2 } from "lucide-react";
import { adminRu } from "../../admin/adminStrings";
import { AdminButton, AdminField, AdminPageHeader, AdminPanel, AdminSaveBar, adminInputClass } from "../../admin/adminUi";
import { useAdminDraft, useAdminPersist } from "../../admin/adminHelpers";
import { useContent } from "../../context/ContentProvider";

export default function AdminReviewsPage() {
  const { reviews } = useContent();
  const { contentSaving, saveError, runSave, updateSection } = useAdminPersist();
  const { draft, setDraft, dirty, reset } = useAdminDraft(reviews);

  const updateReview = (index, patch) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addReview = () => {
    setDraft((prev) => [...prev, { name: "", text: "", rating: 5 }]);
  };

  const removeReview = (index) => {
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const ok = await runSave(() => updateSection("reviews", draft));
    if (ok) reset();
  };

  return (
    <>
      <AdminPageHeader
        title={adminRu.nav.reviews}
        description="Список отзывов гостей в секции рецензий."
        actions={<AdminButton onClick={addReview}><Plus className="mr-1 h-3.5 w-3.5" /> {adminRu.common.review}</AdminButton>}
      />

      <div className="space-y-4">
        {draft.map((review, index) => (
          <AdminPanel key={index}>
            <div className="mb-3 flex justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{adminRu.common.review} {index + 1}</p>
              <AdminButton variant="danger" onClick={() => removeReview(index)}><Trash2 className="h-4 w-4" /></AdminButton>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label={adminRu.common.author}>
                <input value={review.name} onChange={(e) => updateReview(index, { name: e.target.value })} className={adminInputClass()} />
              </AdminField>
              <AdminField label={adminRu.common.rating}>
                <input type="number" min="1" max="5" value={review.rating ?? 5} onChange={(e) => updateReview(index, { rating: Number(e.target.value) })} className={adminInputClass()} />
              </AdminField>
              <div className="sm:col-span-2">
                <AdminField label={adminRu.common.reviewContent}>
                  <textarea value={review.text} onChange={(e) => updateReview(index, { text: e.target.value })} rows={4} className={adminInputClass("resize-y")} />
                </AdminField>
              </div>
            </div>
          </AdminPanel>
        ))}
      </div>

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={dirty} saving={contentSaving} onSave={handleSave} onDiscard={reset} />
    </>
  );
}
