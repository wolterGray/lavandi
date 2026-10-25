import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Loader2,
  Save,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { localeDefaults, ADMIN_LANG_CODES, LANG_LABELS } from "../../admin/siteContent";
import { getAdminSectionKey } from "../../admin/adminNav";
import { filterAdminList, useAdminPersist, useRegisterAdminDirty } from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import { AdminPanel, AdminSaveBar, adminInputClass } from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";
import { useImageSrc } from "../../hooks/useImageSrc";
import { saveSiteImageToDatabase } from "../../admin/siteImages";
import AdminMediaPicker from "../../admin/AdminMediaPicker";

function ServiceThumbnail({ src, alt = "", className = "" }) {
  const { src: resolvedSrc } = useImageSrc(src);
  if (!resolvedSrc) {
    return (
      <div className={`flex items-center justify-center bg-void/80 border border-border/40 text-muted ${className}`}>
        <ImageIcon className="h-4 w-4 opacity-40" aria-hidden />
      </div>
    );
  }
  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={`object-cover object-center ${className}`}
      loading="lazy"
    />
  );
}

export default function AdminServicesPage() {
  const { services, rawContent, overrides, isSupabaseEnabled } = useContent();
  const { contentSaving, saveError, runSave, savePatch } = useAdminPersist();
  const [activeLang, setActiveLang] = useState("pl");
  const [imgDraft, setImgDraft] = useState({});
  const [dirty, setDirty] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(services[0]?.slug ?? "");
  const [copied, setCopied] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  useRegisterAdminDirty(dirty);

  const sourceServices = useMemo(() => {
    const rawServices = rawContent?.services;
    return Array.isArray(rawServices) && rawServices.length ? rawServices : services;
  }, [rawContent?.services, services]);

  const buildInitialTexts = useCallback(() => {
    const drafts = {};
    ADMIN_LANG_CODES.forEach((lang) => {
      drafts[lang] = {};
      services.forEach((service) => {
        const base = localeDefaults[lang]?.servicesItems?.[service.slug] ?? {};
        const override = overrides.locales?.[lang]?.servicesItems?.[service.slug] ?? {};
        drafts[lang][service.slug] = {
          title: override.title ?? base.title ?? service.title ?? "",
          desc: override.desc ?? base.desc ?? service.desc ?? "",
        };
      });
    });
    return drafts;
  }, [services, overrides.locales]);

  const [allTextsDraft, setAllTextsDraft] = useState(buildInitialTexts);

  useEffect(() => {
    if (dirty) return;
    setAllTextsDraft(buildInitialTexts());
    const imgs = {};
    sourceServices.forEach((service) => {
      imgs[service.slug] = service.img ?? "";
    });
    setImgDraft(imgs);
  }, [sourceServices, buildInitialTexts, dirty]);

  useEffect(() => {
    if (services.some((service) => service.slug === selectedSlug)) return;
    setSelectedSlug(services[0]?.slug ?? "");
  }, [selectedSlug, services]);

  const updateImg = (slug, img) => {
    setImgDraft((prev) => ({ ...prev, [slug]: img }));
    setDirty(true);
  };

  const updateText = (slug, patch) => {
    setAllTextsDraft((prev) => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        [slug]: {
          ...prev[activeLang]?.[slug],
          ...patch,
        },
      },
    }));
    setDirty(true);
  };

  const handleSave = useCallback(async () => {
    const imagesChanged = sourceServices.some(
      (service) => (imgDraft[service.slug] ?? service.img ?? "") !== (service.img ?? "")
    );

    const localesPatch = {};
    ADMIN_LANG_CODES.forEach((lang) => {
      localesPatch[lang] = {
        servicesItems: allTextsDraft[lang],
      };
    });

    const ok = await runSave(() =>
      savePatch(() => {
        const patch = {
          locales: localesPatch,
        };

        if (imagesChanged) {
          patch.services = sourceServices.map((service) => ({
            ...service,
            img: imgDraft[service.slug] ?? service.img,
          }));
        }

        return patch;
      }, getAdminSectionKey("/admin/services"))
    );

    if (ok) setDirty(false);
  }, [sourceServices, imgDraft, allTextsDraft, runSave, savePatch]);

  const handleDiscard = () => {
    setAllTextsDraft(buildInitialTexts());
    const imgs = {};
    sourceServices.forEach((service) => {
      imgs[service.slug] = service.img ?? "";
    });
    setImgDraft(imgs);
    setDirty(false);
  };

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

  const filteredServices = useMemo(() => {
    return filterAdminList(services, searchQuery, (service) => {
      const texts = allTextsDraft[activeLang]?.[service.slug] ?? {};
      const allLangTitles = ADMIN_LANG_CODES.map(
        (lang) => allTextsDraft[lang]?.[service.slug]?.title ?? ""
      ).join(" ");
      return `${service.slug} ${service.title ?? ""} ${allLangTitles} ${texts.title ?? ""} ${texts.desc ?? ""}`;
    });
  }, [services, searchQuery, allTextsDraft, activeLang]);

  const selectedService =
    services.find((service) => service.slug === selectedSlug) ?? filteredServices[0] ?? services[0];
  const selectedSourceService =
    sourceServices.find((service) => service.slug === selectedService?.slug) ?? selectedService;
  const selectedTexts = (selectedService && allTextsDraft[activeLang]?.[selectedService.slug]) ?? {};
  const currentImgValue = selectedService ? (imgDraft[selectedService.slug] ?? selectedSourceService?.img ?? "") : "";
  const { src: previewImgSrc } = useImageSrc(currentImgValue);

  const handleCopyUrl = async () => {
    if (!selectedService) return;
    const path = `/uslugi/${selectedService.slug}`;
    const fullUrl = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedService) return;
    setUploadingImage(true);
    setImageError("");
    try {
      const imageRef = await saveSiteImageToDatabase(file, "services", currentImgValue);
      updateImg(selectedService.slug, imageRef);
    } catch (err) {
      setImageError(err.message ?? adminRu.media.uploadFailed);
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const currentTitleLength = String(selectedTexts.title ?? "").length;
  const currentDescLength = String(selectedTexts.desc ?? "").length;

  return (
    <div className="flex flex-col gap-4">
      {!isSupabaseEnabled && (
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/30 px-4 py-2.5 text-xs text-amber-200">
          CRM backend не настроен — изменения сохраняются только локально.
        </div>
      )}

      {/* ========================================================
          Top Command Bar: Breadcrumbs, Languages, Actions, Save
          ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="h-4 w-4 text-gold shrink-0" aria-hidden />
          <span className="font-medium text-stone">Услуги</span>
          <span className="text-muted">/</span>
          <span className="text-milk font-semibold">Редактирование услуги</span>
        </div>

        {/* Right: Languages + View on site + Save */}
        <div className="flex flex-wrap items-center gap-2.5">
          {dirty ? (
            <span className="hidden items-center gap-1.5 text-xs font-medium text-gold xl:inline-flex">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              Несохранённые изменения
            </span>
          ) : null}

          {/* Single clean Language Switcher (UA / PL / EN) */}
          <div className="inline-flex items-center rounded-pill border border-border/60 bg-surface/90 p-0.5 shadow-sm">
            {ADMIN_LANG_CODES.map((code) => {
              const active = activeLang === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setActiveLang(code)}
                  className={`rounded-pill px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    active
                      ? "bg-gold/15 text-gold border border-gold/40 shadow-sm"
                      : "border border-transparent text-stone hover:text-milk"
                  }`}
                >
                  {LANG_LABELS[code]}
                </button>
              );
            })}
          </div>

          {/* View on site */}
          {selectedService ? (
            <a
              href={`/uslugi/${selectedService.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-card border border-border/60 bg-surface/60 px-3.5 py-2 text-xs font-semibold text-stone transition hover:border-gold/30 hover:text-milk"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              <span>Открыть на сайте</span>
            </a>
          ) : null}

          {/* Primary Save Button */}
          <button
            type="button"
            disabled={!dirty || contentSaving}
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-card bg-gold px-4 py-2 text-xs font-semibold text-void shadow-lg shadow-gold/15 transition hover:bg-gold-hover hover:shadow-gold/25 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {contentSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Save className="h-3.5 w-3.5" aria-hidden />
            )}
            <span>Сохранить</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          Workspace: 2-Column Grid (Services List + Editor)
          ======================================================== */}
      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[290px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* ========================================================
            Area B: Services List Column
            ======================================================== */}
        <AdminPanel className="min-w-0 overflow-hidden p-0 sm:p-0 lg:sticky lg:top-4 bg-card/80 backdrop-blur-sm border-border/70 rounded-2xl shadow-spa">
          {/* Header */}
          <div className="border-b border-border/40 p-3.5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold" aria-hidden />
                <h2 className="text-sm font-semibold text-milk">Услуги</h2>
              </div>
              <span className="rounded-pill border border-border/60 bg-void/60 px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                {services.length}
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Найти услугу..."
                className={adminInputClass("pl-9 text-xs")}
              />
            </div>
          </div>

          {/* List */}
          <div className="flex gap-2 overflow-x-auto p-2.5 lg:max-h-[calc(100vh-230px)] lg:flex-col lg:overflow-y-auto">
            {filteredServices.map((service) => {
              const texts = allTextsDraft[activeLang]?.[service.slug] ?? {};
              const title = texts.title || service.title || service.slug;
              const active = selectedService?.slug === service.slug;
              const currentImg = imgDraft[service.slug] ?? service.img;

              return (
                <button
                  key={service.slug}
                  type="button"
                  onClick={() => setSelectedSlug(service.slug)}
                  className={`group flex min-w-[220px] items-center gap-3 rounded-xl border p-2 text-left transition lg:min-w-0 ${
                    active
                      ? "border-gold/40 bg-gold/10 ring-1 ring-gold/20 text-milk"
                      : "border-transparent text-stone hover:border-border/60 hover:bg-surface/80 hover:text-milk"
                  }`}
                >
                  <ServiceThumbnail
                    src={currentImg}
                    alt={title}
                    className="h-[52px] w-[52px] min-h-[52px] min-w-[52px] rounded-lg border border-border/40 bg-void/60"
                  />
                  <div className="min-w-0 flex-1">
                    <span className={`block line-clamp-1 text-sm font-semibold ${active ? "text-gold" : "text-milk"}`}>
                      {title}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] font-mono text-muted">
                      /uslugi/{service.slug}
                    </span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 transition ${
                      active ? "text-gold translate-x-0.5" : "text-muted group-hover:text-stone"
                    }`}
                    aria-hidden
                  />
                </button>
              );
            })}
            {!filteredServices.length && (
              <p className="p-4 text-center text-xs text-muted">Ничего не найдено</p>
            )}
          </div>
        </AdminPanel>

        {/* ========================================================
            Area C: Main Editor (Details + Photo)
            ======================================================== */}
        {selectedService ? (
          <AdminPanel className="min-w-0 overflow-hidden p-5 sm:p-7 bg-card/80 backdrop-blur-sm border-border/70 rounded-2xl shadow-spa">
            {/* Service Header: Title (Serif), Published Badge, URL */}
            <div className="mb-6 border-b border-border/40 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-normal text-milk tracking-tight">
                    {selectedTexts.title || selectedService.title || selectedService.slug}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Опубликовано
                  </span>
                </div>
              </div>

              {/* URL with Copy */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-mono text-muted">
                  /uslugi/{selectedService.slug}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  title="Скопировать URL"
                  className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-surface/60 px-2 py-0.5 text-[11px] text-stone transition hover:border-gold/40 hover:text-milk"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" aria-hidden />
                      <span className="text-emerald-400">Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" aria-hidden />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Editor Columns: Text Editor (Left) & Service Photo (Right) */}
            <div className="grid min-w-0 gap-6 lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] items-start">
              {/* Left Column: Text Inputs */}
              <div className="min-w-0 space-y-5">
                {/* Field 1: Service Name */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
                    <label className="text-milk">
                      Название услуги ({LANG_LABELS[activeLang]})
                    </label>
                    <span className="text-muted text-[11px]">{currentTitleLength}/80</span>
                  </div>
                  <input
                    type="text"
                    value={selectedTexts.title ?? ""}
                    onChange={(event) => updateText(selectedService.slug, { title: event.target.value })}
                    placeholder="Название услуги на выбранном языке"
                    className={adminInputClass("text-sm font-medium py-3 px-3.5")}
                  />
                </div>

                {/* Field 2: Service Description */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
                    <label className="text-milk">
                      Описание услуги ({LANG_LABELS[activeLang]})
                    </label>
                    <span className="text-muted text-[11px]">{currentDescLength}/2000</span>
                  </div>
                  <textarea
                    value={selectedTexts.desc ?? ""}
                    onChange={(event) => updateText(selectedService.slug, { desc: event.target.value })}
                    placeholder="Введите подробное описание массажа, техники, пользы для тела и рекомендаций..."
                    rows={11}
                    className={adminInputClass("min-h-[250px] max-h-[500px] text-sm leading-[1.65] resize-y p-3.5")}
                  />
                </div>
              </div>

              {/* Right Column: Service Photo Panel */}
              <div className="min-w-0 space-y-3 xl:border-l xl:border-border/40 xl:pl-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-milk uppercase tracking-wider">
                    Фотография услуги
                  </h3>
                </div>

                {/* Photo Preview Card with Aspect Ratio */}
                <div className="group relative aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-xl border border-border/60 bg-void/70 shadow-spa">
                  {previewImgSrc ? (
                    <>
                      <img
                        src={previewImgSrc}
                        alt={selectedTexts.title || selectedService.slug}
                        className="h-full w-full object-cover object-center transition duration-200 group-hover:scale-[1.01]"
                      />
                      {/* Trash action button in top right overlay */}
                      <button
                        type="button"
                        onClick={() => updateImg(selectedService.slug, "")}
                        title="Удалить фото"
                        aria-label="Удалить фото услуги"
                        className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-void/80 text-stone shadow-md backdrop-blur-sm transition hover:border-red-500/40 hover:bg-red-950/80 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>

                      {/* Expand preview button on hover */}
                      <button
                        type="button"
                        onClick={() => setPreviewModalOpen(true)}
                        className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-void/85 py-2 text-[10px] font-bold uppercase tracking-wider text-stone backdrop-blur-sm opacity-0 transition group-hover:opacity-100 hover:text-gold"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden />
                        Увеличить фото
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-muted">
                      <ImageIcon className="h-10 w-10 opacity-30" aria-hidden />
                      <span className="text-xs">Фотография не установлена</span>
                    </div>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {/* Action Buttons */}
                <div className="space-y-2 max-w-[320px]">
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-xs font-semibold text-gold transition hover:border-gold hover:bg-gold/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Upload className="h-4 w-4" aria-hidden />
                    )}
                    <span>Заменить фото</span>
                  </button>

                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => setMediaPickerOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-surface/60 px-4 py-2.5 text-xs font-medium text-stone transition hover:border-border hover:bg-surface hover:text-milk disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ImageIcon className="h-4 w-4" aria-hidden />
                    <span>Выбрать из медиатеки</span>
                  </button>
                </div>

                {imageError ? <p className="text-xs text-red-300">{imageError}</p> : null}

                {/* Helper text */}
                <div className="max-w-[320px] text-[11px] leading-relaxed text-muted space-y-0.5 pt-1">
                  <p>Рекомендуемый размер: 1200×1600 px</p>
                  <p>Форматы: JPG, PNG, WebP. До 5 МБ.</p>
                </div>
              </div>
            </div>
          </AdminPanel>
        ) : null}
      </div>

      {/* Media Picker Modal */}
      <AdminMediaPicker
        open={mediaPickerOpen}
        folder="services"
        onSelect={(imgRef) => {
          if (selectedService) {
            updateImg(selectedService.slug, imgRef);
          }
          setMediaPickerOpen(false);
        }}
        onClose={() => setMediaPickerOpen(false)}
      />

      {/* Fullscreen Photo Preview Modal */}
      {previewImgSrc && previewModalOpen ? (
        <div
          className="fixed inset-0 z-[260] flex items-center justify-center bg-void/90 p-4 backdrop-blur-md"
          role="presentation"
          onClick={() => setPreviewModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl border border-border/60 bg-surface p-4 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Предпросмотр фото"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                {selectedTexts.title || selectedService?.slug}
              </span>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gold px-3.5 text-xs font-bold uppercase tracking-wider text-void transition hover:bg-gold-hover"
                onClick={() => setPreviewModalOpen(false)}
              >
                <X className="h-4 w-4" aria-hidden />
                <span>Закрыть</span>
              </button>
            </div>
            <div className="flex max-h-[80vh] items-center justify-center overflow-hidden rounded-xl bg-void/50 p-2">
              <img src={previewImgSrc} alt="" className="max-h-[74vh] max-w-full object-contain" />
            </div>
          </div>
        </div>
      ) : null}

      {/* Error & Save Bar */}
      {saveError && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-xs text-red-200">
          {saveError}
        </div>
      )}

      <AdminSaveBar
        dirty={dirty}
        saving={contentSaving}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </div>
  );
}
