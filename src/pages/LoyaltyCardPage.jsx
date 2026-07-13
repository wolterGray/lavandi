import { useEffect, useMemo, useState } from "react";
import { Copy, ExternalLink, Gift, ShieldCheck } from "lucide-react";
import { useParams } from "react-router-dom";

const BACKEND_URL =
  import.meta.env.VITE_CRM_BACKEND_URL || "https://api.nuarr.pl";

const tierLabels = {
  MEMBER: "NUAR MEMBER",
  SILVER: "NUAR SILVER",
  GOLD: "NUAR GOLD",
  DIAMOND: "NUAR DIAMOND",
  ROYAL: "NUAR ROYAL",
};

const tierCardClasses = {
  MEMBER: {
    accent: "#d4bd82",
    background:
      "bg-[linear-gradient(112deg,transparent_0%,rgba(255,255,255,0.08)_42%,transparent_54%),radial-gradient(circle_at_82%_18%,rgba(212,189,130,0.2),transparent_28%),linear-gradient(135deg,#090a0b,#303232_48%,#111111_100%)]",
    text: "text-[#f5f0e6]",
  },
  SILVER: {
    accent: "#dce3ee",
    background:
      "bg-[repeating-linear-gradient(105deg,rgba(255,255,255,0.07)_0_1px,transparent_1px_10px),linear-gradient(102deg,rgba(255,255,255,0.08)_0%,transparent_18%,rgba(255,255,255,0.32)_42%,transparent_54%,rgba(255,255,255,0.1)_100%),radial-gradient(circle_at_82%_18%,rgba(220,227,238,0.26),transparent_30%),linear-gradient(135deg,#0c0f12,#8a939c_40%,#333b43_62%,#101317)]",
    text: "text-[#f6f8fb]",
  },
  GOLD: {
    accent: "#f1ce7b",
    background:
      "bg-[repeating-linear-gradient(105deg,rgba(255,228,143,0.08)_0_1px,transparent_1px_11px),linear-gradient(110deg,rgba(255,236,178,0.08)_0%,transparent_20%,rgba(255,225,139,0.34)_43%,transparent_56%,rgba(164,111,36,0.22)_100%),radial-gradient(circle_at_80%_18%,rgba(241,206,123,0.3),transparent_30%),linear-gradient(135deg,#170c04,#9b6f2f_42%,#4a2a0e_64%,#090604)]",
    text: "text-[#fff5dc]",
  },
  DIAMOND: {
    accent: "#eaf6ff",
    background:
      "bg-[radial-gradient(ellipse_at_28%_24%,rgba(255,255,255,0.18),transparent_18%),radial-gradient(ellipse_at_78%_72%,rgba(166,220,255,0.16),transparent_22%),radial-gradient(circle_at_50%_46%,rgba(204,235,255,0.18),transparent_34%),linear-gradient(122deg,transparent_0%,rgba(255,255,255,0.26)_34%,transparent_46%,rgba(166,220,255,0.18)_70%,transparent_100%),linear-gradient(135deg,#02060c,#31485a_45%,#122334_68%,#05070d)]",
    text: "text-[#f7fbff]",
  },
  ROYAL: {
    accent: "#d7a46d",
    background:
      "bg-[radial-gradient(circle_at_50%_46%,rgba(42,32,74,0.6),transparent_34%),radial-gradient(circle_at_76%_12%,rgba(215,164,109,0.08),transparent_28%),radial-gradient(circle_at_12%_88%,rgba(83,35,96,0.2),transparent_34%),repeating-linear-gradient(86deg,rgba(255,255,255,0.018)_0_1px,transparent_1px_4px),linear-gradient(135deg,#070414,#151027_46%,#0b0718_74%,#03020a)]",
    text: "text-[#f0c18b]",
  },
};

const stringsByLanguage = {
  en: {
    booking: "Book a visit",
    cardInactive: "The card is inactive",
    copied: "Link copied",
    copyLink: "Copy link",
    failed: "Could not open the card",
    loading: "Loading card...",
    remaining: "Remaining until reward",
    rewardAvailable: "Reward is available",
    status: "Status",
    subtitle: "Membership card",
    title: "NUAR CLUB",
    updated: "Last update",
  },
  pl: {
    booking: "Zarezerwuj wizytę",
    cardInactive: "Karta jest nieaktywna",
    copied: "Link skopiowany",
    copyLink: "Kopiuj link",
    failed: "Nie udało się otworzyć karty",
    loading: "Ładowanie karty...",
    remaining: "Do nagrody pozostało",
    rewardAvailable: "Nagroda jest dostępna",
    status: "Status",
    subtitle: "Karta członkowska",
    title: "NUAR CLUB",
    updated: "Ostatnia aktualizacja",
  },
  ru: {
    booking: "Записаться",
    cardInactive: "Карта неактивна",
    copied: "Ссылка скопирована",
    copyLink: "Скопировать ссылку",
    failed: "Не удалось открыть карту",
    loading: "Загрузка карты...",
    remaining: "До подарка осталось",
    rewardAvailable: "Подарок доступен",
    status: "Статус",
    subtitle: "Карта лояльности",
    title: "NUAR CLUB",
    updated: "Последнее обновление",
  },
};
const defaultStrings = stringsByLanguage.pl;

async function fetchPublicLoyaltyCard(token) {
  const response = await fetch(
    `${BACKEND_URL}/api/public/loyalty/${encodeURIComponent(token)}`,
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || defaultStrings.failed);
  }

  return payload?.data ?? null;
}

const getGiftLabel = (language) => {
  if (language === "en") return "gift";
  if (language === "pl") return "prezent";
  return "подарок";
};

const getLoyaltyLabel = (language) => {
  if (language === "en") return "loyalty card";
  if (language === "pl") return "karta lojalnosciowa";
  return "карта лояльности";
};

function NuarClubCard({ card, target }) {
  const tier = String(card?.tier || "MEMBER").toUpperCase();
  const tierLabel = tierLabels[tier] || tierLabels.MEMBER;
  const style = tierCardClasses[tier] || tierCardClasses.MEMBER;
  const name = card?.displayName || "NUAR Member";
  const stamps = Math.min(6, Math.max(0, Number(card?.stamps) || 0));
  const isRewardReady = Boolean(card?.rewardAvailable) && stamps >= target;
  const giftLabel = getGiftLabel(card?.cardLanguage);

  return (
    <article
      className={`group relative aspect-[1.586/1] w-full overflow-hidden rounded-lg ${style.background} p-5 text-white shadow-[0_32px_90px_rgba(0,0,0,0.42)] ring-1 ring-white/10 transition duration-500 hover:-translate-y-1 hover:shadow-[0_40px_110px_rgba(0,0,0,0.5)] sm:p-6`}
      style={{ "--card-accent": style.accent }}
    >
      <div className="absolute inset-y-0 -left-1/2 w-1/2 rotate-12 bg-white/10 blur-2xl transition duration-700 group-hover:left-full" />

      <div className="relative z-10 flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-4">
          <span className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${style.text}`}>
            {tierLabel}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/62">
            NUAR CLUB
          </span>
        </div>

        <div className="grid justify-items-center gap-2 text-center">
          <small
            className="font-sans text-[9px] font-extrabold uppercase tracking-[0.18em] opacity-70"
            style={{ color: style.accent }}
          >
            {getLoyaltyLabel(card?.cardLanguage)}
          </small>
          <strong
            className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-['Snell_Roundhand','Zapfino','Brush_Script_MT','Segoe_Script',cursive] text-[34px] font-normal leading-none opacity-90 sm:text-[48px]"
            style={{ color: style.accent }}
          >
            {name}
          </strong>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="grid max-w-[250px] flex-1 grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, index) => {
              const isGift = index === 5;
              const filled = index < stamps;
              return (
                <span
                  className={`grid aspect-square place-items-center rounded-full border text-[10px] ${
                    filled ? "bg-[color:var(--card-accent)]/20" : ""
                  } ${isGift && isRewardReady ? "animate-pulse shadow-[0_0_18px_var(--card-accent)]" : ""}`}
                  key={index}
                  style={{
                    borderColor: style.accent,
                    color: style.accent,
                  }}
                  title={isGift ? giftLabel : undefined}
                >
                  {isGift ? <Gift size={14} strokeWidth={1.5} /> : ""}
                </span>
              );
            })}
          </div>
          <span className="text-sm font-black" style={{ color: style.accent }}>
            {stamps}/6
          </span>
        </div>
      </div>
    </article>
  );
}

export default function LoyaltyCardPage() {
  const { token = "" } = useParams();
  const [card, setCard] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(token));

  const publicUrl = typeof window === "undefined" ? "" : window.location.href;
  const strings = stringsByLanguage[card?.cardLanguage] || defaultStrings;
  const target = Math.max(6, Number(card?.targetStamps) || 6);
  const stamps = Math.max(0, Number(card?.stamps) || 0);
  const remaining = Math.max(0, target - stamps);
  const progress = Math.min(100, Math.round((stamps / target) * 100));
  const updatedAt = useMemo(() => {
    const value = card?.lastTransactionAt || card?.updatedAt;
    if (!value) return "—";
    const date = new Date(value);
    const locale = card?.cardLanguage === "ru" ? "ru-RU" : card?.cardLanguage === "en" ? "en-US" : "pl-PL";
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(locale);
  }, [card?.cardLanguage, card?.lastTransactionAt, card?.updatedAt]);

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "noindex, nofollow");
    document.title = "NUAR Club";
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setError(defaultStrings.failed);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError("");
    fetchPublicLoyaltyCard(token)
      .then((data) => {
        if (!cancelled) {
          setCard(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(defaultStrings.failed);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const copyLink = async () => {
    if (!publicUrl) return;
    await navigator.clipboard?.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="min-h-screen bg-[#120d16] px-4 py-8 text-[#f8f0df] sm:px-6">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-[#d6bb7d]/24 bg-[#d6bb7d]/10 text-[#d6bb7d]">
              <ShieldCheck size={19} />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-[0.12em] text-[#d6bb7d]">
                {strings.title}
              </h1>
              <p className="text-sm text-[#f8f0df]/62">{strings.subtitle}</p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-[#f8f0df]/72">
              {strings.loading}
            </div>
          ) : error || !card ? (
            <div className="rounded-[24px] border border-[#d6bb7d]/20 bg-[#d6bb7d]/8 p-6">
              <strong className="block text-base text-[#d6bb7d]">{strings.failed}</strong>
              <span className="mt-1 block text-sm text-[#f8f0df]/68">
                {strings.cardInactive}
              </span>
            </div>
          ) : (
            <NuarClubCard card={card} target={target} />
          )}
        </div>

        {card ? (
          <aside className="rounded-[24px] border border-white/10 bg-[#211628]/82 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-[0.18em] text-[#d6bb7d]/80">
                  {strings.status}
                </span>
                <strong className="mt-1 block text-2xl">
                  {stamps}/{target}
                </strong>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/64">
                {card.tier ? tierLabels[String(card.tier).toUpperCase()] : "NUAR MEMBER"}
              </span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <span
                className="block h-full rounded-full bg-[#d6bb7d]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <strong className="block">
                {card.rewardAvailable
                  ? strings.rewardAvailable
                  : `${strings.remaining}: ${remaining}`}
              </strong>
              <span className="mt-1 block text-sm text-[#f8f0df]/58">
                {strings.updated}: {updatedAt}
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              <a
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d6bb7d] px-5 text-sm font-bold text-[#1e1324] transition hover:bg-[#f0d894]"
                href={card.bookingUrl || "https://nuarr.pl"}
                rel="noreferrer"
                target="_blank"
              >
                {strings.booking}
                <ExternalLink size={15} />
              </a>
              <button
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 px-5 text-sm font-bold text-[#f8f0df] transition hover:border-[#d6bb7d]/45"
                type="button"
                onClick={copyLink}
              >
                <Copy size={15} />
                {copied ? strings.copied : strings.copyLink}
              </button>
            </div>
          </aside>
        ) : null}
      </section>
    </main>
  );
}
