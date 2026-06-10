import { useRef, useState } from "react";
import { useImageSrc } from "../hooks/useImageSrc";
import { adminRu } from "./adminStrings";
import { isImageRef, saveSiteImageToDatabase } from "./siteImages";
import { AdminButton, AdminField } from "./adminUi";

export default function AdminImageField({
  label,
  value,
  onChange,
  folder = "uploads",
  previewClassName = "mt-3 h-24 w-24 rounded-card object-cover ring-1 ring-border/50",
}) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const previewSrc = useImageSrc(value);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const imageRef = await saveSiteImageToDatabase(file, folder);
      onChange(imageRef);
    } catch (uploadError) {
      setError(uploadError.message ?? adminRu.media.uploadFailed);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <AdminField label={label}>
      <div className="flex flex-wrap items-start gap-3">
        {previewSrc ? <img src={previewSrc} alt="" className={previewClassName} /> : null}
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
          <AdminButton
            variant="ghost"
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? adminRu.media.uploading : adminRu.media.upload}
          </AdminButton>
          {error && <p className="text-xs text-red-300">{error}</p>}
        </div>
      </div>
    </AdminField>
  );
}
