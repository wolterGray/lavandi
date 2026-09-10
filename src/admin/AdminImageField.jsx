import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useImageSrc } from "../hooks/useImageSrc";
import AdminMediaPicker from "./AdminMediaPicker";
import { adminRu } from "./adminStrings";
import { isImageRef, saveSiteImageToDatabase } from "./siteImages";
import { AdminButton, AdminField } from "./adminUi";

export default function AdminImageField({
  label,
  value,
  onChange,
  folder = "uploads",
  previewClassName = "mt-3 h-24 w-24 rounded-card object-cover ring-1 ring-border/50",
  allowRemove = true,
}) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { src: previewSrc } = useImageSrc(value);

  useEffect(() => {
    if (!previewOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setPreviewOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [previewOpen]);

  const handleRemove = async () => {
    setError("");
    onChange("");
  };

  const uploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const imageRef = await saveSiteImageToDatabase(file, folder, value);
      onChange(imageRef);
    } catch (uploadError) {
      setError(uploadError.message ?? adminRu.media.uploadFailed);
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    await uploadFile(file);
    event.target.value = "";
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files?.[0];
    await uploadFile(file);
  };

  return (
    <AdminField label={label}>
      <div
        className={`flex flex-wrap items-start gap-3 rounded-card border border-dashed p-3 transition ${
          dragOver ? "border-gold/50 bg-gold/5" : "border-border/40"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {previewSrc ? (
          <button
            type="button"
            className={`${previewClassName} group relative overflow-hidden text-left transition hover:ring-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/70`}
            onClick={() => setPreviewOpen(true)}
            aria-label={`Открыть предпросмотр: ${label}`}
          >
            <img src={previewSrc} alt="" className="h-full max-h-full w-full object-contain object-center" />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-void/75 px-2 py-1 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-cream opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              Просмотр
            </span>
          </button>
        ) : null}
        <div className="min-w-0 flex-1 space-y-2">
          {isImageRef(value) ? (
            <p className="rounded-card border border-border/60 bg-surface px-3 py-2.5 text-xs text-stone" title={value}>
              {adminRu.media.storedInDb}. Можно заменить, выбрать из медиатеки или убрать из черновика.
            </p>
          ) : value ? (
            <p className="text-xs text-muted">{adminRu.media.legacyUrlHint}</p>
          ) : (
            <p className="text-xs text-muted">{adminRu.media.noImage}</p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={handleUpload}
          />
          <div className="flex flex-wrap gap-2">
            <AdminButton
              variant="ghost"
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? adminRu.media.uploading : adminRu.media.upload}
            </AdminButton>
            <AdminButton variant="ghost" type="button" disabled={uploading} onClick={() => setPickerOpen(true)}>
              {adminRu.media.pickFromLibrary}
            </AdminButton>
            {allowRemove && (value || previewSrc) ? (
              <AdminButton variant="danger" type="button" disabled={uploading} onClick={handleRemove}>
                {adminRu.media.removeImage}
              </AdminButton>
            ) : null}
          </div>
          {error && <p className="text-xs text-red-300">{error}</p>}
        </div>
      </div>
      <AdminMediaPicker
        open={pickerOpen}
        folder={folder}
        onSelect={onChange}
        onClose={() => setPickerOpen(false)}
      />
      {previewSrc && previewOpen ? (
        <div
          className="fixed inset-0 z-[260] flex items-center justify-center bg-void/90 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl rounded-card border border-border/60 bg-surface p-3 shadow-spa-hover"
            role="dialog"
            aria-modal="true"
            aria-label={`Предпросмотр: ${label}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-void/80 text-cream transition hover:border-gold/60"
              onClick={() => setPreviewOpen(false)}
              aria-label="Закрыть предпросмотр"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
            <div className="flex max-h-[82vh] items-center justify-center overflow-hidden rounded-card bg-void/40 p-4">
              <img src={previewSrc} alt="" className="max-h-[76vh] max-w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </AdminField>
  );
}
