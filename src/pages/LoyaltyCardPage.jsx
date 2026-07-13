import { useEffect, useState } from "react";
import { ExternalLink, Gift, ShieldCheck } from "lucide-react";
import { useParams } from "react-router-dom";

const BACKEND_URL =
  import.meta.env.VITE_CRM_BACKEND_URL || "https://api.nuarr.pl";
const REVIEW_URL = "https://g.page/r/CZGwQdcksfMuEAE/review";

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
    failed: "Could not open the card",
    loading: "Loading card...",
    review: "Leave a review",
    subtitle: "Membership card",
    title: "NUAR CLUB",
  },
  pl: {
    booking: "Zarezerwuj wizytę",
    cardInactive: "Karta jest nieaktywna",
    failed: "Nie udało się otworzyć karty",
    loading: "Ładowanie karty...",
    review: "Zostaw opinię",
    subtitle: "Karta członkowska",
    title: "NUAR CLUB",
  },
  ru: {
    booking: "Записаться",
    cardInactive: "Карта неактивна",
    failed: "Не удалось открыть карту",
    loading: "Загрузка карты...",
    review: "Оставить отзыв",
    subtitle: "Карта лояльности",
    title: "NUAR CLUB",
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
      className={`group relative aspect-[1.586/1] w-full overflow-hidden rounded-lg ${style.background} text-white shadow-[0_24px_70px_rgba(0,0,0,0.42)] ring-1 ring-white/10 transition duration-500 hover:shadow-[0_34px_95px_rgba(0,0,0,0.5)]`}
      style={{ "--card-accent": style.accent }}
    >
      <style>{`
        @keyframes nuarClubCardSheen {
          0% { transform: translateX(-135%) rotate(14deg); opacity: 0; }
          18% { opacity: 0.36; }
          52% { opacity: 0.2; }
          76% { opacity: 0.34; }
          100% { transform: translateX(330%) rotate(14deg); opacity: 0; }
        }

        @keyframes nuarClubCardSoftWash {
          0%, 100% { transform: translate3d(-14%, -4%, 0) scale(1.02); opacity: 0.18; }
          45% { transform: translate3d(12%, 5%, 0) scale(1.08); opacity: 0.34; }
          70% { transform: translate3d(4%, -2%, 0) scale(1.04); opacity: 0.26; }
        }

        @keyframes nuarClubCardColorFlow {
          0%, 100% { transform: translateX(-10%) rotate(0deg); opacity: 0.2; }
          50% { transform: translateX(10%) rotate(2deg); opacity: 0.42; }
        }

        @keyframes nuarClubFilledGlow {
          0%, 100% { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--card-accent) 48%, transparent), inset 0 0 14px color-mix(in srgb, var(--card-accent) 24%, transparent), 0 0 8px color-mix(in srgb, var(--card-accent) 18%, transparent); }
          50% { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--card-accent) 82%, transparent), inset 0 0 20px color-mix(in srgb, var(--card-accent) 44%, transparent), 0 0 18px color-mix(in srgb, var(--card-accent) 34%, transparent); }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24%_78%,color-mix(in_srgb,var(--card-accent)_24%,transparent),transparent_30%),radial-gradient(circle_at_78%_18%,color-mix(in_srgb,var(--card-accent)_18%,transparent),transparent_24%),linear-gradient(112deg,transparent_0%,color-mix(in_srgb,var(--card-accent)_16%,transparent)_42%,transparent_60%)] blur-[1px] [animation:nuarClubCardSoftWash_8s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute inset-[-18%] bg-[conic-gradient(from_160deg_at_50%_50%,transparent,color-mix(in_srgb,var(--card-accent)_16%,transparent),transparent,color-mix(in_srgb,var(--card-accent)_22%,transparent),transparent)] blur-xl [animation:nuarClubCardColorFlow_11s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute inset-y-[-30%] left-0 w-1/3 bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--card-accent)_34%,rgba(255,255,255,0.12)),transparent)] blur-2xl [animation:nuarClubCardSheen_6.8s_ease-in-out_infinite]" />

      <div className="absolute inset-x-4 bottom-5 top-4 z-10 flex flex-col justify-between gap-2 sm:inset-x-6 sm:bottom-6 sm:top-6 sm:gap-4">
        <div className="flex items-start justify-between gap-4">
          <span className={`text-[10px] font-extrabold uppercase tracking-[0.16em] ${style.text} sm:text-[11px]`}>
            {tierLabel}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/62">
            NUAR CLUB
          </span>
        </div>

        <div className="grid -translate-y-1 justify-items-center gap-1.5 text-center sm:translate-y-0 sm:gap-2">
          <small
            className="font-sans text-[8px] font-extrabold uppercase tracking-[0.16em] opacity-70 sm:text-[9px]"
            style={{ color: style.accent }}
          >
            {getLoyaltyLabel(card?.cardLanguage)}
          </small>
          <strong
            className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-['Snell_Roundhand','Zapfino','Brush_Script_MT','Segoe_Script',cursive] text-[28px] font-normal leading-none opacity-90 sm:text-[48px]"
            style={{ color: style.accent }}
          >
            {name}
          </strong>
        </div>

        <div className="flex items-end justify-between gap-3 sm:gap-4">
          <div className="grid max-w-[210px] flex-1 grid-cols-6 gap-1.5 sm:max-w-[250px] sm:gap-2">
            {Array.from({ length: 6 }).map((_, index) => {
              const isGift = index === 5;
              const filled = index < stamps;
              return (
                <span
                  className={`relative grid aspect-square place-items-center overflow-hidden rounded-full border text-[10px] ${
                    filled ? "bg-[radial-gradient(circle_at_34%_28%,rgba(255,255,255,0.55),transparent_23%),linear-gradient(135deg,color-mix(in_srgb,var(--card-accent)_42%,transparent),color-mix(in_srgb,var(--card-accent)_14%,transparent))] [animation:nuarClubFilledGlow_3.8s_ease-in-out_infinite]" : ""
                  } ${isGift && isRewardReady ? "animate-pulse shadow-[0_0_20px_var(--card-accent)]" : ""}`}
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
          <span className="text-xs font-black sm:text-sm" style={{ color: style.accent }}>
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(token));

  const strings = stringsByLanguage[card?.cardLanguage] || defaultStrings;
  const target = Math.max(6, Number(card?.targetStamps) || 6);

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

  return (
    <main className="h-[100svh] overflow-hidden bg-[#120d16] px-4 py-4 text-[#f8f0df] sm:min-h-screen sm:overflow-auto sm:px-6 sm:py-8">
      <section className="mx-auto grid h-full w-full max-w-3xl content-center gap-4 sm:min-h-[calc(100vh-4rem)] sm:gap-6">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-3 sm:mb-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#d6bb7d]/24 bg-[#d6bb7d]/10 text-[#d6bb7d] sm:h-11 sm:w-11">
              <ShieldCheck size={18} />
            </span>
            <div>
              <h1 className="text-base font-semibold tracking-[0.12em] text-[#d6bb7d] sm:text-xl">
                {strings.title}
              </h1>
              <p className="text-xs text-[#f8f0df]/62 sm:text-sm">{strings.subtitle}</p>
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

          {card ? (
            <div className="mt-4 grid gap-2.5 sm:mt-6 sm:grid-cols-2 sm:gap-3">
              <a
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#d6bb7d] px-5 text-sm font-bold text-[#1e1324] transition hover:bg-[#f0d894] sm:min-h-12"
                href={card.bookingUrl || "https://nuarr.pl"}
                rel="noreferrer"
                target="_blank"
              >
                {strings.booking}
                <ExternalLink size={15} />
              </a>
              <a
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 px-5 text-sm font-bold text-[#f8f0df] transition hover:border-[#d6bb7d]/45 sm:min-h-12"
                href={REVIEW_URL}
                rel="noreferrer"
                target="_blank"
              >
                {strings.review}
                <ExternalLink size={15} />
              </a>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
