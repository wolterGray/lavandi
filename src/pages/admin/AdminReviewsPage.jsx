import { useState } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { getAdminSectionKey } from "../../admin/adminNav";
import { getSectionMeta } from "../../admin/adminSectionMeta";
import {
  cloneAtIndex,
  filterAdminList,
  useAdminConfirm,
  useAdminDraft,
  useAdminPersist,
  useRegisterAdminDirty,
} from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import {
  AdminButton,
  AdminDraftRecoveryBanner,
  AdminEmptyState,
  AdminField,
  AdminListSearch,
  AdminPageHeader,
  AdminPanel,
  AdminSaveBar,
  AdminSearchEmpty,
  AdminTextarea,
  adminInputClass,
} from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

export default function AdminReviewsPage() {
  const { reviews, overrides } = useContent();
  const { contentSaving, saveError, runSave, saveSection } = useAdminPersist();
  const {
    draft,
    setDraft,
    dirty,
    reset,
    recoveryOffer,
    acceptRecovery,
    dismissRecovery,
  } = useAdminDraft(reviews);
  const [searchQuery, setSearchQuery] = useState("");
  const requestConfirm = useAdminConfirm();
  useRegisterAdminDirty(dirty);

  const filtered = filterAdminList(draft, searchQuery, (review) => `${review.name} ${review.text}`);
  const sectionSavedAt = getSectionMeta(overrides, getAdminSectionKey("/admin/reviews"));

  const updateReview = (index, patch) => {
    setDraft((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const addReview = () => {
    setDraft((prev) => [{ name: "", text: "", rating: 5 }, ...prev]);
  };

  const cloneReview = (index) => {
    setDraft((prev) => cloneAtIndex(prev, index));
  };

  const removeReview = async (index) => {
    const review = draft[index];
    const ok = await requestConfirm({
      title: adminRu.common.confirmDeleteTitle,
      message: review?.name ? `Удалить отзыв от «${review.name}»?` : adminRu.common.confirmDeleteMessage,
      variant: "danger",
      confirmLabel: adminRu.common.delete,
    });
    if (!ok) return;
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const ok = await runSave(() => saveSection("reviews", draft));
    if (ok) reset();
  };

  return (
    <>
      {recoveryOffer ? (
        <AdminDraftRecoveryBanner
          savedAt={recoveryOffer.savedAt}
          onRestore={acceptRecovery}
          onDismiss={dismissRecovery}
        />
      ) : null}

      <AdminPageHeader
        title={adminRu.nav.reviews}
        description="Список отзывов гостей в секции рецензий."
        sectionSavedAt={sectionSavedAt}
        actions={
          <AdminButton onClick={addReview}>
            <Plus className="mr-1 h-3.5 w-3.5" /> {adminRu.common.review}
          </AdminButton>
        }
      />

      <AdminListSearch value={searchQuery} onChange={setSearchQuery} />

      {draft.length === 0 ? (
        <AdminEmptyState />
      ) : filtered.length === 0 ? (
        <AdminSearchEmpty />
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => {
            const index = draft.indexOf(review);
            return (
              <AdminPanel key={`${review.name}-${index}`}>
                <div className="mb-3 flex justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    {adminRu.common.review} {index + 1}
                  </p>
                  <div className="flex gap-1">
                    <AdminButton variant="ghost" onClick={() => cloneReview(index)} aria-label={adminRu.common.clone}>
                      <Copy className="h-4 w-4" />
                    </AdminButton>
                    <AdminButton variant="danger" onClick={() => removeReview(index)}>
                      <Trash2 className="h-4 w-4" />
                    </AdminButton>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label={adminRu.common.author}>
                    <input
                      value={review.name}
                      onChange={(e) => updateReview(index, { name: e.target.value })}
                      className={adminInputClass()}
                    />
                  </AdminField>
                  <AdminField label={adminRu.common.rating}>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={review.rating ?? 5}
                      onChange={(e) => updateReview(index, { rating: Number(e.target.value) })}
                      className={adminInputClass()}
                    />
                  </AdminField>
                  <div className="sm:col-span-2">
                    <AdminField label={adminRu.common.reviewContent}>
                      <AdminTextarea
                        value={review.text}
                        onChange={(e) => updateReview(index, { text: e.target.value })}
                        rows={4}
                        maxLength={600}
                      />
                    </AdminField>
                  </div>
                </div>
              </AdminPanel>
            );
          })}
        </div>
      )}

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={dirty} saving={contentSaving} onSave={handleSave} onDiscard={reset} />
    </>
  );
}
