import { useRef, useState } from "react";
import { ADMIN_LOCALE, adminRu } from "../../admin/adminStrings";
import { AdminButton, AdminPageHeader, AdminPanel, AdminSaveBar } from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

export default function AdminSettingsPage() {
  const {
    exportContent,
    importContent,
    resetContent,
    publishFullSnapshot,
    hasOverrides,
    isSupabaseEnabled,
    lastSyncedAt,
    syncError,
  } = useContent();
  const fileRef = useRef(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleExport = () => {
    const blob = new Blob([exportContent()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nuar-content-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("JSON-файл скачан.");
    setError("");
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const text = await file.text();
      await importContent(text);
      setMessage(
        isSupabaseEnabled
          ? "Импорт завершён и сохранён в Supabase."
          : "Импорт завершён. Изменения сохранены локально в этом браузере."
      );
    } catch (importError) {
      setError(importError.message ?? "Не удалось загрузить файл. Проверьте формат JSON.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  const handlePublishFull = async () => {
    if (!window.confirm(adminRu.sync.publishConfirm)) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await publishFullSnapshot();
      setMessage(adminRu.sync.publishDone);
    } catch (publishError) {
      setError(publishError.message ?? adminRu.sync.saveFailed);
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Удалить все переопределения контента?")) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await resetContent();
      setMessage(
        isSupabaseEnabled
          ? "Восстановлены данные по умолчанию, Supabase очищен."
          : "Восстановлены данные по умолчанию из репозитория."
      );
    } catch (resetError) {
      setError(resetError.message ?? "Сброс не удался.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title={adminRu.nav.settings}
        description={
          isSupabaseEnabled
            ? "Контент сайта синхронизируется с Supabase. Экспорт/импорт JSON работает как резервная копия."
            : "Экспортируйте изменения в JSON или импортируйте предыдущую копию. Без Supabase изменения сохраняются только локально."
        }
      />

      <div className="grid max-w-2xl gap-4">
        {isSupabaseEnabled && (
          <AdminPanel className="border-emerald-900/30 bg-emerald-950/20">
            <h3 className="font-display text-xl text-milk">Supabase</h3>
            <p className="mt-2 text-sm text-stone">
              CMS использует таблицу <code className="text-gold">site_content</code> в вашем проекте Supabase.
              {lastSyncedAt ? ` Последняя синхронизация: ${new Date(lastSyncedAt).toLocaleString(ADMIN_LOCALE)}.` : ""}
            </p>
            {syncError && <p className="mt-2 text-sm text-red-300">{syncError}</p>}
            <p className="mt-3 text-xs text-muted">
              Контент: <code className="text-gold">001_site_content.sql</code>.
              Изображения в базе: <code className="text-gold">003_site_images.sql</code>.
            </p>
            <AdminButton className="mt-4" onClick={handlePublishFull} disabled={busy}>
              {busy ? adminRu.sync.publishing : adminRu.sync.publishFull}
            </AdminButton>
            <p className="mt-3 text-xs text-muted">
              Публикует полный снимок CMS (тексты PL/EN/UA, отзывы, галерея, FAQ, фото услуг) в <code className="text-gold">site_content</code>.
              Цены и длительности услуг приходят из CRM автоматически. Фото — в <code className="text-gold">site_images</code>, ссылка <code className="text-gold">dbimg:…</code>.
            </p>
          </AdminPanel>
        )}

        <AdminPanel>
          <h3 className="font-display text-xl text-milk">Экспорт</h3>
          <p className="mt-2 text-sm text-stone">Скачать текущие переопределения как JSON-файл.</p>
          <AdminButton className="mt-4" onClick={handleExport} disabled={busy}>
            Скачать JSON
          </AdminButton>
        </AdminPanel>

        <AdminPanel>
          <h3 className="font-display text-xl text-milk">Импорт</h3>
          <p className="mt-2 text-sm text-stone">Загрузить JSON-файл, экспортированный из панели.</p>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImport} />
          <AdminButton className="mt-4" variant="ghost" onClick={() => fileRef.current?.click()} disabled={busy}>
            Выбрать файл
          </AdminButton>
        </AdminPanel>

        <AdminPanel>
          <h3 className="font-display text-xl text-milk">Сброс</h3>
          <p className="mt-2 text-sm text-stone">
            {hasOverrides
              ? "Есть активные переопределения. Сброс вернёт данные по умолчанию из кода сайта."
              : "Переопределений нет — сброс не нужен."}
          </p>
          <AdminButton className="mt-4" variant="danger" onClick={handleReset} disabled={!hasOverrides || busy}>
            Удалить переопределения
          </AdminButton>
        </AdminPanel>

        {!isSupabaseEnabled && (
          <AdminPanel>
            <h3 className="font-display text-xl text-milk">Локальный режим</h3>
            <p className="mt-2 text-sm text-stone">
              Укажите в файле <code className="text-gold">.env</code>:
            </p>
            <pre className="mt-3 overflow-x-auto rounded-card bg-surface p-3 text-xs text-stone">
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ADMIN_PASSWORD=nuar2025`}
            </pre>
            <p className="mt-3 text-xs text-muted">
              Без Supabase панель использует пароль из <code className="text-gold">VITE_ADMIN_PASSWORD</code> (по умолчанию: nuar2025).
            </p>
          </AdminPanel>
        )}
      </div>

      {message && <p className="mt-6 text-sm text-gold">{message}</p>}
      {error && <p className="mt-6 text-sm text-red-300">{error}</p>}

      <AdminSaveBar mode="info" hint={adminRu.common.settingsHint} />
    </>
  );
}
