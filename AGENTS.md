# NUAR — контекст для ИИ (CRM + админка + сайт)

Этот файл описывает **всю экосистему NUAR**. Читай его в начале любой задачи, связанной с сайтом, админкой или CRM.

---

## Троица: три части, один Supabase

| Часть | Репозиторий | Что это | Продакшен URL |
|-------|-------------|---------|---------------|
| **Сайт** | `wolterGray/lavandi` | Публичный SPA nuarr.pl (лендинг, услуги, каталог косметики) | https://nuarr.pl |
| **Админка сайта** | тот же `lavandi`, маршруты `/admin/*` | CMS: тексты, фото, отзывы, галерея, косметика, GA4 | https://nuarr.pl/admin |
| **CRM** | `wolterGray/nuar-crm` | Внутренняя CRM: визиты, клиенты, услуги, цены, сотрудники | Vercel (отдельный проект) |

**Один проект Supabase** на все три части. Ключи: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (или `VITE_SUPABASE_ANON_KEY`).

Миграции SQL для CMS: `lavandi/supabase/migrations/`.

---

## Два типа изменений (критично!)

### 1. Контент (без git push)

Тексты, фото, отзывы, товары косметики, настройки GA — **сохраняются в Supabase** через админку (кнопка «Сохранить»).

- Таблица: `site_content` (строка `id = 'main'`, поле `data` — JSON)
- Картинки: `site_images` (ссылки в контенте вида `dbimg:<uuid>`)
- На сайте видно **сразу после сохранения** + обновление страницы (Cmd+Shift+R)

### 2. Код (нужен git push)

Новый UI, логика, роуты, компоненты админки — **меняется в git** → деплой:

```
git push → main → Vercel пересобирает nuarr.pl (~1–2 мин)
              └→ GitHub Actions → gh-pages (woltergray.github.io/lavandi, без домена)
```

**Продакшен для пользователей — nuarr.pl на Vercel**, не GitHub Pages.

Файл `.env.production` в `lavandi` закоммичен (публичные VITE_* ключи Supabase и GA).

---

## Кто что пишет в `site_content`

```
CRM (услуги/цены)  ──авто──►  site_content.data.services (price, time)
Админка (контент)  ──Save──►  site_content.data (всё остальное)
Публичный сайт     ◄──read──  site_content + site_images при загрузке
```

| Данные | Кто главный | Где править |
|--------|-------------|-------------|
| Цены и длительности услуг | **CRM** | CRM → каталог услуг (синхронизация ~1.2 с) |
| Фото/тексты услуг | **Админка** | `/admin/services` (цены только просмотр) |
| Косметика (каталог) | **Админка** | `/admin/cosmetics` |
| Команда, отзывы, галерея, FAQ, контакты | **Админка** | соответствующие вкладки |
| Hero, новости на главной | **Админка** | `/admin/home` |
| Google Analytics | **Админка** | `/admin/analytics` |

CRM **не** дублирует кнопки «опубликовать» — цены уходят автоматически (`nuar-crm/src/utils/siteSync.js`).

---

## Авторизация

- **CRM**: Supabase Auth (email + пароль)
- **Админка сайта**: тот же Supabase Auth; вход из CRM через SSO (`lavandi/src/admin/adminSso.js`) — CRM открывает `/admin#access_token=...&refresh_token=...`
- Локальный fallback без Supabase: `VITE_ADMIN_PASSWORD` (только dev)

Запись в `site_content` / `site_images` требует роль **authenticated** (RLS).

---

## Структура `lavandi` (сайт + админка)

```
src/
  pages/              # Публичные страницы (Landing, Service, Cosmetics, Product)
  pages/admin/        # Страницы CMS
  admin/              # Логика админки (auth, contentStore, siteImages, adminUi)
  context/ContentProvider.jsx   # Загрузка/сохранение Supabase, merge с локалями
  components/CosmeticsSection/  # Каталог, карточки, поиск, /katalog/:id
  i18n/locales/       # pl, en, uk — дефолтные тексты
  data/               # JSON-заглушки (services, cosmetics, team…)
supabase/migrations/  # site_content, site_images
```

### Важные маршруты сайта

- `/` — главная
- `/uslugi/:slug` — страница услуги
- `/katalog` — каталог косметики (поиск по названию и ID)
- `/katalog/:id` — карточка товара (описание, состав, mailto «Поинтересоваться»)
- `/admin`, `/admin/cosmetics`, … — CMS

### Косметика (кратко)

- ID товара — случайный числовой номер, закрепляется за товаром; удалённые ID попадают в пул `cosmeticRetiredIds`
- До 3 «популярных» на главной: `featuredCosmeticIds`
- Поля: название, описание, объём, состав (PL/EN/UA)
- `transparentPhoto` (по умолчанию `true`) — светлая подложка для PNG без фона
- Тексты при сохранении копируются во все языки; на сайте fallback между локалями

### UI-правила

- Палитра **заблокирована** — см. `.cursor/rules/nuar-palette.mdc` (тёплый тёмный aubergine, не менять без запроса)
- Админка — **русский** UI (`src/admin/adminStrings.js`)
- Сайт — **pl / en / uk**, дефолт языка **pl**

---

## Структура `nuar-crm`

```
src/
  App.jsx                    # Монолит CRM (страницы через activePage)
  components/pages/SitePage.jsx   # «Сайт» — ссылка на nuarr.pl и кнопка «Открыть админку»
  utils/siteSync.js          # Автосинхронизация цен услуг → site_content
  utils/openSiteAdmin.js     # SSO-открытие админки с токенами сессии
  data/siteServicesCatalog.js   # Базовый каталог услуг для маппинга с CRM
```

CRM и сайт **не** в одном репозитории. При задачах CRM смотри также этот файл в `lavandi`.

---

## Команды разработки

### lavandi
```bash
npm run dev      # http://localhost:5173
CI=true npm run build   # сборка как на CI (без imagemin)
```

### nuar-crm
```bash
npm run dev
npm run build
```

---

## Типичные ошибки (не повторять)

1. **Ждать git push после правки текстов в админке** — контент уже в Supabase.
2. **Считать GitHub Pages = nuarr.pl** — прод на Vercel.
3. **Отключать Vercel** (`ignoreCommand` в vercel.json) — nuarr.pl перестанет обновляться.
4. **Пустые строки в CMS overrides** — перезаписывали дефолтные тексты; при сохранении используется `sanitizeCosmeticsProductsDraft` / `mergeProductTexts`.
5. **Хранить огромные base64 в `cosmetics[].img`** — использовать `site_images` + `dbimg:` (лимит хранилища Supabase ~50 МБ).

---

## Git

- Пользователь обычно ожидает **commit + push** после изменений кода (если не сказано иначе).
- Не коммитить секреты (приватные ключи, `.env.local` с секретами).
- Репозитории: `main` → автодеплой.

---

## Ссылки

- Сайт: https://nuarr.pl
- GitHub lavandi: https://github.com/wolterGray/lavandi
- GitHub nuar-crm: https://github.com/wolterGray/nuar-crm
- Actions lavandi: https://github.com/wolterGray/lavandi/actions
