import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  cloneAtIndex,
  useAdminConfirm,
  useAdminPersist,
  useRegisterAdminDirty,
} from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import AdminMediaPicker from "../../admin/AdminMediaPicker";
import {
  AdminButton,
  AdminEmptyState,
  AdminSaveBar,
  adminInputClass,
} from "../../admin/adminUi";
import { saveSiteImageToDatabase } from "../../admin/siteImages";
import { useContent } from "../../context/ContentProvider";
import { useImageSrc } from "../../hooks/useImageSrc";

const ALT_OPTIONS = [
  { key: "studio", label: "Интерьер студии (studio)" },
  { key: "ambience", label: "Атмосфера релакса (ambience)" },
  { key: "ritual", label: "Ритуал массажа (ritual)" },
  { key: "space", label: "Пространство восстановления (space)" },
  { key: "classic", label: "Классический массаж (classic)" },
  { key: "relax", label: "Релаксирующий массаж (relax)" },
  { key: "signature", label: "Авторский массаж (signature)" },
  { key: "sport", label: "Спортивный массаж (sport)" },
  { key: "care", label: "Уходовый ритуал (care)" },
];

/**
 * Individual Gallery Card component with its own preview resolution and file uploader
 */
function GalleryItemCard({
  item,
  index,
  total,
  onUpdate,
  onMove,
  onClone,
  onRemove,
  onOpenPreview,
  onOpenPicker,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const { src: previewSrc, loading: previewLoading } = useImageSrc(item.src);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");
    try {
      const imageRef = await saveSiteImageToDatabase(file, "gallery");
      onUpdate({ src: imageRef });
    } catch (error) {
      setUploadError(error.message || adminRu.media.uploadFailed);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const isMainTile = index === 0;

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-card border transition-all duration-200 ${
        isMainTile
          ? "border-gold/50 bg-gradient-to-b from-surface/95 to-gold/[0.04] shadow-spa ring-1 ring-gold/25"
          : "border-border/60 bg-surface/85 shadow-sm hover:border-gold/30 hover:bg-surface/95"
      }`}
    >
      {/* Top Bar inside Card */}
      <div className="flex items-center justify-between border-b border-border/40 px-3.5 py-2.5 bg-void/30">
        <div className="flex items-center gap-2">
          {isMainTile ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gold shadow-sm">
              ⭐ Главная плитка (2×2)
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-border/70 bg-void/50 px-2.5 py-0.5 text-[11px] font-semibold text-stone">
              № {index + 1}
            </span>
          )}
        </div>

        {/* Order & Card Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            title="Переместить влево (выше)"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 text-stone transition hover:border-gold/40 hover:bg-gold/10 hover:text-gold disabled:cursor-not-allowed disabled:opacity-25"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
            title="Переместить вправо (ниже)"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 text-stone transition hover:border-gold/40 hover:bg-gold/10 hover:text-gold disabled:cursor-not-allowed disabled:opacity-25"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onClone(index)}
            title="Дублировать карточку"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 text-stone transition hover:border-gold/40 hover:bg-gold/10 hover:text-gold"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            title="Удалить карточку"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-900/30 text-stone transition hover:border-red-500/50 hover:bg-red-950/60 hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Image Preview Container */}
      <div className="p-3.5 pb-2">
        <div className="group/image relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border/50 bg-void/60 shadow-inner">
          {previewLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gold/60" />
            </div>
          ) : previewSrc ? (
            <>
              <img
                src={previewSrc}
                alt={item.altKey}
                className="h-full w-full object-cover object-center transition duration-300 group-hover/image:scale-[1.03]"
              />

              {/* Hover actions overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-void/75 opacity-0 backdrop-blur-xs transition duration-200 group-hover/image:opacity-100">
                <button
                  type="button"
                  onClick={() => onOpenPreview(previewSrc, item.altKey)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-void/90 px-3 py-1.5 text-xs font-semibold text-milk shadow transition hover:bg-gold hover:text-void"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Увеличить
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface/90 px-3 py-1 text-[11px] font-medium text-stone transition hover:border-gold hover:text-gold disabled:opacity-40"
                  >
                    <Upload className="h-3 w-3" />
                    Заменить
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenPicker(index)}
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface/90 px-3 py-1 text-[11px] font-medium text-stone transition hover:border-gold hover:text-gold"
                  >
                    <ImageIcon className="h-3 w-3" />
                    Из медиатеки
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
              <ImageIcon className="h-8 w-8 text-muted/40" />
              <p className="text-xs text-muted">Фото не выбрано</p>
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] font-semibold text-gold transition hover:bg-gold/20"
                >
                  Загрузить
                </button>
                <button
                  type="button"
                  onClick={() => onOpenPicker(index)}
                  className="rounded-lg border border-border/60 bg-surface px-2.5 py-1 text-[11px] text-stone transition hover:text-milk"
                >
                  Медиатека
                </button>
              </div>
            </div>
          )}

          {uploading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-void/85 text-xs text-gold backdrop-blur-xs">
              <Loader2 className="h-6 w-6 animate-spin text-gold" />
              <span>Сжатие и загрузка...</span>
            </div>
          ) : null}
        </div>

        {uploadError ? <p className="mt-1.5 text-xs text-red-300">{uploadError}</p> : null}
      </div>

      {/* Hidden File Input for this card */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Card Footer: Alt Key selector */}
      <div className="border-t border-border/40 p-3.5 pt-2.5 bg-void/20">
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">
          Подпись на сайте (Alt Key)
        </label>
        <select
          value={item.altKey}
          onChange={(event) => onUpdate({ altKey: event.target.value })}
          className={adminInputClass("text-xs py-1.5 bg-surface/90")}
        >
          {ALT_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function AdminGalleryPage() {
  const { gallery } = useContent();
  const { contentSaving, saveError, runSave, savePatch } = useAdminPersist();
  const [draft, setDraft] = useState(gallery);
  const [dirty, setDirty] = useState(false);
  const [previewModal, setPreviewModal] = useState({ open: false, src: "", title: "" });
  const [mediaPickerState, setMediaPickerState] = useState({ open: false, targetIndex: null });
  const [uploadingNew, setUploadingNew] = useState(false);
  const [topUploadError, setTopUploadError] = useState("");

  const newPhotoInputRef = useRef(null);
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
      title: "Удалить фото?",
      message: `Удалить фото №${index + 1} из галереи? Не забудьте нажать «Сохранить», чтобы применить изменения на сайте.`,
      variant: "danger",
      confirmLabel: adminRu.common.delete,
    });
    if (!ok) return;

    // Locally update draft state; saves on "Сохранить"
    setDraft((prev) => prev.filter((_, i) => i !== index));
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

  const handleAddNewPhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingNew(true);
    setTopUploadError("");
    try {
      const imageRef = await saveSiteImageToDatabase(file, "gallery");
      setDraft((prev) => [{ src: imageRef, altKey: "studio" }, ...prev]);
      setDirty(true);
    } catch (error) {
      setTopUploadError(error.message || adminRu.media.uploadFailed);
    } finally {
      setUploadingNew(false);
      event.target.value = "";
    }
  };

  const handleMediaPickerSelect = (imgRef) => {
    if (mediaPickerState.targetIndex !== null) {
      updateItem(mediaPickerState.targetIndex, { src: imgRef });
    } else {
      // Add as new item to front
      setDraft((prev) => [{ src: imgRef, altKey: "studio" }, ...prev]);
      setDirty(true);
    }
    setMediaPickerState({ open: false, targetIndex: null });
  };

  const handleSave = useCallback(async () => {
    // Filter out items that have no image attached
    const cleanDraft = draft.filter((item) => Boolean(item.src?.trim()));
    const ok = await runSave(() => savePatch({ gallery: cleanDraft }, "gallery"));
    if (ok) {
      setDraft(cleanDraft);
      setDirty(false);
    }
  }, [draft, runSave, savePatch]);

  // Keyboard shortcut Cmd+S / Ctrl+S
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (dirty && !contentSaving) {
          handleSave();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dirty, contentSaving, handleSave]);

  const handleDiscard = () => {
    setDraft(gallery);
    setDirty(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ========================================================
          Top Command Bar: Breadcrumbs, Stats, Actions, Save
          ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
        {/* Left: Breadcrumbs & Counter */}
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-gold shrink-0" aria-hidden />
          <span className="text-xs font-medium text-stone">Контент</span>
          <span className="text-xs text-muted">/</span>
          <span className="text-xs font-semibold text-milk">Галерея студии</span>
          <span className="ml-1 inline-flex items-center rounded-full border border-border/60 bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-stone">
            Всего: {draft.length} фото
          </span>
        </div>

        {/* Right: Actions + Save */}
        <div className="flex flex-wrap items-center gap-2.5">
          {dirty ? (
            <span className="hidden items-center gap-1.5 text-xs font-medium text-gold xl:inline-flex">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              Несохранённые изменения
            </span>
          ) : null}

          {/* Hidden File Input for New Photo */}
          <input
            ref={newPhotoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAddNewPhotoUpload}
          />

          {/* Add Photo Button */}
          <button
            type="button"
            disabled={uploadingNew}
            onClick={() => newPhotoInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-pill border border-gold/50 bg-gold/15 px-3.5 py-1.5 text-xs font-semibold text-gold transition hover:border-gold hover:bg-gold/25 disabled:opacity-40"
          >
            {uploadingNew ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            <span>Добавить фото</span>
          </button>

          {/* Pick from Library Button */}
          <button
            type="button"
            onClick={() => setMediaPickerState({ open: true, targetIndex: null })}
            className="inline-flex items-center gap-1.5 rounded-pill border border-border/60 bg-surface/80 px-3 py-1.5 text-xs font-medium text-stone transition hover:border-border hover:bg-surface hover:text-milk"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Медиатека</span>
          </button>

          {/* View on Site */}
          <a
            href="/#gallery"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-pill border border-border/60 bg-surface/60 px-3 py-1.5 text-xs font-medium text-stone transition hover:border-border hover:bg-surface hover:text-milk"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>На сайте</span>
          </a>

          {/* Save Button */}
          <button
            type="button"
            disabled={!dirty || contentSaving}
            onClick={handleSave}
            className={`inline-flex items-center gap-2 rounded-pill px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
              dirty
                ? "bg-gold text-void shadow-lg shadow-gold/20 hover:bg-gold/90"
                : "border border-border/40 bg-surface/40 text-stone/50 cursor-not-allowed"
            }`}
          >
            {contentSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Сохранение...</span>
              </>
            ) : (
              <span>Сохранить</span>
            )}
          </button>
        </div>
      </div>

      {topUploadError ? (
        <div className="rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-2.5 text-xs text-red-200">
          {topUploadError}
        </div>
      ) : null}

      {/* ========================================================
          Notice Banner: Visual Mosaic Tip
          ======================================================== */}
      <div className="flex flex-col gap-1.5 rounded-card border border-gold/20 bg-gradient-to-r from-gold/[0.07] via-surface/60 to-surface/40 p-4 text-xs leading-relaxed text-stone">
        <div className="flex items-center gap-2 font-semibold text-milk">
          <Sparkles className="h-3.5 w-3.5 text-gold shrink-0" />
          <span>Как устроена галерея NUAR на сайте:</span>
        </div>
        <p className="text-muted">
          <strong className="text-gold">Фото №1</strong> отображается как большая главная плитка (2×2).
          Остальные снимки формируют компактную мозаику студии. Используйте стрелки{" "}
          <strong className="text-milk">←</strong> и <strong className="text-milk">→</strong> для
          перемещения фотографий. Все изменения сохраняются по нажатию кнопки «Сохранить».
        </p>
      </div>

      {/* ========================================================
          Gallery Grid
          ======================================================== */}
      {draft.length === 0 ? (
        <AdminEmptyState
          title="Галерея пуста"
          description="Добавьте первые фотографии студии, интерьера и атмосферы"
          action={
            <AdminButton onClick={() => newPhotoInputRef.current?.click()}>
              <Plus className="mr-1.5 h-4 w-4" /> Добавить фото
            </AdminButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {draft.map((item, index) => (
            <GalleryItemCard
              key={`${item.src}-${index}`}
              item={item}
              index={index}
              total={draft.length}
              onUpdate={(patch) => updateItem(index, patch)}
              onMove={moveItem}
              onClone={cloneItem}
              onRemove={removeItem}
              onOpenPreview={(src, title) => setPreviewModal({ open: true, src, title })}
              onOpenPicker={(idx) => setMediaPickerState({ open: true, targetIndex: idx })}
            />
          ))}

          {/* Last Card: Interactive Add Photo Tile */}
          <div
            onClick={() => newPhotoInputRef.current?.click()}
            className="group flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border/70 bg-surface/30 p-6 text-center transition hover:border-gold/60 hover:bg-gold/[0.04]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-gold transition group-hover:scale-110 group-hover:bg-gold/20">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-milk group-hover:text-gold transition">
                Добавить новое фото
              </p>
              <p className="mt-0.5 text-[11px] text-muted">
                Нажмите для загрузки с устройства
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMediaPickerState({ open: true, targetIndex: null });
              }}
              className="mt-1 rounded-pill border border-border/60 bg-surface/80 px-3 py-1 text-[11px] text-stone transition hover:border-gold hover:text-gold"
            >
              Или выбрать из медиатеки
            </button>
          </div>
        </div>
      )}

      {/* Save Error Display */}
      {saveError && (
        <div className="rounded-xl border border-red-900/40 bg-red-950/40 p-4 text-xs text-red-200">
          <p className="font-semibold">Ошибка сохранения:</p>
          <p className="mt-0.5 opacity-90">{saveError}</p>
        </div>
      )}

      {/* Sticky Save Bar when dirty */}
      <AdminSaveBar
        dirty={dirty}
        saving={contentSaving}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />

      {/* ========================================================
          Enlarged Photo Preview Modal
          ======================================================== */}
      {previewModal.open && (
        <div
          className="fixed inset-0 z-[260] flex items-center justify-center bg-void/90 p-4 backdrop-blur-md"
          role="presentation"
          onClick={() => setPreviewModal({ open: false, src: "", title: "" })}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-card border border-border/60 bg-surface p-4 shadow-spa-hover"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">
                Предпросмотр фото: {previewModal.title}
              </p>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border/60 bg-surface px-3 text-xs text-stone transition hover:border-gold hover:text-milk"
                onClick={() => setPreviewModal({ open: false, src: "", title: "" })}
              >
                <X className="h-3.5 w-3.5" />
                Закрыть
              </button>
            </div>
            <div className="flex max-h-[75vh] items-center justify-center overflow-hidden rounded-xl bg-void/50 p-2">
              <img
                src={previewModal.src}
                alt=""
                className="max-h-[72vh] max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          Admin Media Picker Modal
          ======================================================== */}
      <AdminMediaPicker
        open={mediaPickerState.open}
        folder="gallery"
        onSelect={handleMediaPickerSelect}
        onClose={() => setMediaPickerState({ open: false, targetIndex: null })}
      />
    </div>
  );
}
