import { Link } from "react-router-dom";
import { AdminPageHeader, AdminPanel, AdminSaveBar } from "../../admin/adminUi";
import { adminRu } from "../../admin/adminStrings";
import { useContent } from "../../context/ContentProvider";

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

export default function AdminDashboardPage() {
  const { services, cosmetics, reviews, team, hasOverrides, isSupabaseEnabled } = useContent();

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

      {hasOverrides && !isSupabaseEnabled && (
        <AdminPanel className="mt-6 border-gold/20 bg-gold/[0.04]">
          <p className="text-sm text-milk">В этом браузере активны локальные переопределения контента.</p>
        </AdminPanel>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {LINKS.map((item) => (
          <Link key={item.to} to={item.to} className="rounded-card border border-border/50 bg-card p-5 transition hover:border-gold/30 hover:shadow-spa">
            <h3 className="font-display text-xl text-milk">{item.title}</h3>
            <p className="mt-2 text-sm text-stone">{item.desc}</p>
          </Link>
        ))}
      </div>

      <AdminSaveBar mode="info" hint={adminRu.common.dashboardHint} />
    </>
  );
}
