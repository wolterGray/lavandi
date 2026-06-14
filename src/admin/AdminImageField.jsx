import { useRef, useState } from "react";
import { useImageSrc } from "../hooks/useImageSrc";
import AdminMediaPicker from "./AdminMediaPicker";
import { adminRu } from "./adminStrings";
import { deleteSiteImageByRef, isImageRef, saveSiteImageToDatabase } from "./siteImages";
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
  const [dragOver, setDragOver] = useState(false);
  const { src: previewSrc } = useImageSrc(value);

  const handleRemove = async () => {
    setError("");
    setUploading(true);

    try {
      if (isImageRef(value)) {
        await deleteSiteImageByRef(value);
      }
      onChange("");
    } catch (removeError) {
      setError(removeError.message ?? adminRu.media.removeFailed);
    } finally {
      setUploading(false);
    }
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
          <div className={previewClassName}>
            <img src={previewSrc} alt="" className="max-h-full w-full object-contain object-center" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1 space-y-2">
          {isImageRef(value) ? (
            <p className="rounded-card border border-border/60 bg-surface px-3 py-2.5 text-xs text-stone">
              {adminRu.media.storedInDb}: <span className="text-milk">{value}</span>
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
    </AdminField>
  );
}
