import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminPageHeader, AdminPanel, AdminSaveBar } from "../../admin/adminUi";
import { ADMIN_LOCALE, adminRu } from "../../admin/adminStrings";
import { fetchSiteImagesStorageUsage } from "../../admin/siteImages";
import { useContent } from "../../context/ContentProvider";

import { ADMIN_SECTION_KEYS } from "../../admin/adminNav";

const LINKS = [
  { to: "/admin/home", title: "Главная", desc: "Hero-слайды и новости (до 5)" },
  { to: "/admin/services", title: "Услуги", desc: "Фото и тексты (цены — в CRM)" },
  { to: "/admin/cosmetics", title: "Косметика", desc: "Каталог продуктов и тексты" },
  { to: "/admin/gallery", title: "Галерея", desc: "Атмосфера студии — фотографии" },
  { to: "/admin/reviews", title: "Отзывы", desc: "Отзывы гостей" },
  { to: "/admin/about", title: "Философия", desc: "Секция «О нас» — текст и фото" },
  { to: "/admin/trust", title: "Доверие", desc: "Пять карточек доверия" },
  { to: "/admin/stats", title: "Статистика", desc: "Цифры NUAR в числах" },
  { to: "/admin/team", title: "Команда", desc: "Персонал — фото, роли, биографии" },
  { to: "/admin/faq", title: "FAQ", desc: "Часто задаваемые вопросы" },
  { to: "/admin/contact", title: "Контакты", desc: "Адрес, телефон, карта" },
  { to: "/admin/analytics", title: "Аналитика", desc: "Google Analytics 4" },
  { to: "/admin/settings", title: "Настройки", desc: "Экспорт / импорт JSON" },
];

function formatSyncTime(value) {
  if (!value) return adminRu.common.neverEdited;
  try {
    return new Date(value).toLocaleString(ADMIN_LOCALE);
  } catch {
    return value;
  }
}

function formatMb(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1);
}

export default function AdminDashboardPage() {
  const { services, cosmetics, reviews, team, hasOverrides, isSupabaseEnabled, syncError, lastSyncedAt, sectionMeta } = useContent();
  const [storage, setStorage] = useState({ bytes: 0, count: 0 });

  useEffect(() => {
    if (!isSupabaseEnabled) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const usage = await fetchSiteImagesStorageUsage();
        if (!cancelled) setStorage(usage);
      } catch {
        // ignore meter errors on dashboard
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSupabaseEnabled, lastSyncedAt]);

  return (
    <>
      <AdminPageHeader
        title="Главная панель"
        description={
          isSupabaseEnabled
            ? "Редактируйте секции сайта NUAR. Изменения сохраняются в Supabase и видны всем посетителям."
            : "Редактируйте все секции сайта NUAR. Изменения сохраняются локально — подключите Supabase в настройках для синхронизации с продакшеном."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminPanel><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">{adminRu.nav.services}</p><p className="mt-2 font-display text-3xl text-milk">{services.length}</p></AdminPanel>
        <AdminPanel><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">{adminRu.nav.cosmetics}</p><p className="mt-2 font-display text-3xl text-milk">{cosmetics.length}</p></AdminPanel>
        <AdminPanel><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">{adminRu.nav.reviews}</p><p className="mt-2 font-display text-3xl text-milk">{reviews.length}</p></AdminPanel>
        <AdminPanel><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">{adminRu.nav.team}</p><p className="mt-2 font-display text-3xl text-milk">{team.length}</p></AdminPanel>
      </div>

      {isSupabaseEnabled && (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <AdminPanel>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">Синхронизация</p>
            <p className={`mt-2 text-sm ${syncError ? "text-red-300" : "text-emerald-200"}`}>
              {syncError ? adminRu.common.syncErrorShort : adminRu.common.syncHealthy}
            </p>
            <p className="mt-1 text-xs text-muted">{adminRu.common.lastUpdate}: {formatSyncTime(lastSyncedAt)}</p>
          </AdminPanel>
          <AdminPanel>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">Хранилище фото</p>
            <p className="mt-2 text-sm text-milk">{adminRu.media.storageUsage(formatMb(storage.bytes), storage.count)}</p>
          </AdminPanel>
          <AdminPanel>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">Быстрые действия</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/admin/settings" className="text-xs font-bold uppercase tracking-[0.1em] text-gold hover:underline">
                {adminRu.common.openSettings}
              </Link>
              <span className="text-muted">·</span>
              <span className="text-xs text-stone">{adminRu.common.commandHint}</span>
            </div>
          </AdminPanel>
        </div>
      )}

      {hasOverrides && !isSupabaseEnabled && (
        <AdminPanel className="mt-6 border-gold/20 bg-gold/[0.04]">
          <p className="text-sm text-milk">В этом браузере активны локальные переопределения контента.</p>
        </AdminPanel>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {LINKS.map((item) => {
          const sectionKey = ADMIN_SECTION_KEYS[item.to];
          const editedAt = sectionMeta?.[sectionKey];
          return (
          <Link key={item.to} to={item.to} className="rounded-card border border-border/50 bg-card p-5 transition hover:border-gold/30 hover:shadow-spa">
            <h3 className="font-display text-xl text-milk">{item.title}</h3>
            <p className="mt-2 text-sm text-stone">{item.desc}</p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.1em] text-muted">
              {adminRu.common.lastEdited}: {formatSyncTime(editedAt)}
            </p>
          </Link>
        );
        })}
      </div>

      <AdminSaveBar mode="info" hint={`${adminRu.common.dashboardHint} ${adminRu.common.commandHint}`} />
    </>
  );
}
