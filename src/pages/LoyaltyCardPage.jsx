import { useEffect, useState } from "react";
import { CalendarDays, Crown, Diamond, ExternalLink, Gift, MapPin, Medal, ShieldCheck, Star } from "lucide-react";
import { useParams } from "react-router-dom";
import { BOOKSY_URL } from "../constants/theme";
import "./LoyaltyCardPage.css";

const BACKEND_URL =
  import.meta.env.VITE_CRM_BACKEND_URL || "https://api.nuarr.pl";
const REVIEW_URL = "https://g.page/r/CZGwQdcksfMuEAE/review";
const MAPS_URL = "https://maps.google.com/?q=NUAR%20Warszawa";
const DESIGN_TIMEOUT_MS = 2500;

const localTierBackgrounds = {
  DIAMOND: "/loyalty-card-assets/diamond.jpg",
  GOLD: "/loyalty-card-assets/gold.jpg",
  MEMBER: "/loyalty-card-assets/member.jpg",
  ROYAL: "/loyalty-card-assets/royal.jpg",
  SILVER: "/loyalty-card-assets/silver.jpg",
};

const tierIcons = {
  DIAMOND: Diamond,
  GOLD: Star,
  MEMBER: ShieldCheck,
  ROYAL: Crown,
  SILVER: Medal,
};

const fallbackTierDesign = {
  MEMBER: {
    accent: "#d4bd82",
    badge: "MEMBER",
    backgroundImage:
      "linear-gradient(112deg, transparent 0%, rgba(255,255,255,.08) 42%, transparent 54%), radial-gradient(circle at 82% 18%, rgba(212,189,130,.2), transparent 28%), linear-gradient(135deg, #090a0b, #303232 48%, #111 100%)",
    inkGradient:
      "linear-gradient(92deg, rgba(255,243,204,.92), rgba(212,189,130,.9) 42%, rgba(165,128,64,.88) 74%, rgba(255,230,156,.78))",
    label: "NUAR MEMBER",
    shine: { color: "rgba(212,189,130,.18)", duration: "8.5s", rotate: "14deg" },
    text: "#f5f0e6",
  },
  SILVER: {
    accent: "#dce3ee",
    badge: "SILVER",
    backgroundImage:
      "linear-gradient(102deg, rgba(255,255,255,.08) 0%, transparent 18%, rgba(255,255,255,.32) 42%, transparent 54%, rgba(255,255,255,.1) 100%), radial-gradient(circle at 82% 18%, rgba(220,227,238,.26), transparent 30%), linear-gradient(135deg, #0c0f12, #8a939c 40%, #333b43 62%, #101317)",
    inkGradient:
      "linear-gradient(94deg, rgba(255,255,255,.92), rgba(214,223,235,.76) 46%, rgba(134,148,164,.82) 74%, rgba(246,249,255,.76))",
    label: "NUAR SILVER",
    shine: { color: "rgba(225,235,245,.2)", duration: "7.6s", rotate: "-14deg" },
    text: "#f6f8fb",
  },
  GOLD: {
    accent: "#f1ce7b",
    badge: "GOLD",
    backgroundImage:
      "linear-gradient(110deg, rgba(255,236,178,.08) 0%, transparent 20%, rgba(255,225,139,.34) 43%, transparent 56%, rgba(164,111,36,.22) 100%), radial-gradient(circle at 80% 18%, rgba(241,206,123,.3), transparent 30%), linear-gradient(135deg, #170c04, #9b6f2f 42%, #4a2a0e 64%, #090604)",
    inkGradient:
      "linear-gradient(92deg, rgba(255,241,189,.98), rgba(255,213,112,.82) 42%, rgba(161,99,24,.84) 74%, rgba(255,229,146,.88))",
    label: "NUAR GOLD",
    shine: { color: "rgba(255,205,90,.22)", duration: "8.2s", rotate: "9deg" },
    text: "#fff5dc",
  },
  DIAMOND: {
    accent: "#eaf6ff",
    badge: "DIAMOND",
    backgroundImage:
      "radial-gradient(ellipse at 28% 24%, rgba(255,255,255,.18), transparent 18%), radial-gradient(ellipse at 78% 72%, rgba(166,220,255,.16), transparent 22%), radial-gradient(circle at 50% 46%, rgba(204,235,255,.18), transparent 34%), linear-gradient(122deg, transparent 0%, rgba(255,255,255,.26) 34%, transparent 46%, rgba(166,220,255,.18) 70%, transparent 100%), linear-gradient(135deg, #02060c, #31485a 45%, #122334 68%, #05070d)",
    inkGradient:
      "linear-gradient(94deg, rgba(255,255,255,.94), rgba(204,233,255,.72) 44%, rgba(101,164,210,.82) 72%, rgba(239,249,255,.82))",
    label: "NUAR DIAMOND",
    shine: { color: "rgba(170,225,255,.24)", duration: "6.8s", rotate: "31deg" },
    text: "#f7fbff",
  },
  ROYAL: {
    accent: "#e2ad56",
    badge: "ROYALTY",
    backgroundImage:
      "radial-gradient(circle at 50% 46%, rgba(42,32,74,.6), transparent 34%), radial-gradient(circle at 76% 12%, rgba(215,164,109,.08), transparent 28%), radial-gradient(circle at 12% 88%, rgba(83,35,96,.2), transparent 34%), linear-gradient(135deg, #070414, #151027 46%, #0b0718 74%, #03020a)",
    inkGradient:
      "linear-gradient(92deg, rgba(255,236,174,.98), rgba(226,173,86,.92) 34%, rgba(124,74,22,.94) 66%, rgba(255,216,128,.88))",
    label: "NUAR ROYALTY",
    shine: { color: "rgba(143,67,214,.22)", duration: "9.4s", rotate: "-8deg" },
    text: "#f2c88b",
  },
};

const stringsByLanguage = {
  en: {
    booking: "Book a visit",
    cardInactive: "The card is inactive",
    failed: "Could not open the card",
    loading: "Loading card...",
    review: "Leave a review",
    tabCard: "Card",
    tabGifts: "Gifts",
    tabVisit: "Visit",
    subtitle: "Membership card",
    title: "NUAR CLUB",
    noVisit: "No active booking",
    nextVisit: "Next visit",
    route: "Route",
    noGifts: "No gifts yet",
    unopenedChests: "Chests",
    openChest: "Open chest",
    availableRewards: "Available rewards",
    usedRewards: "Used rewards",
    visitsToChest: "visits to the next chest",
  },
  pl: {
    booking: "Zarezerwuj wizytę",
    cardInactive: "Karta jest nieaktywna",
    failed: "Nie udało się otworzyć karty",
    loading: "Ładowanie karty...",
    review: "Zostaw opinię",
    tabCard: "Karta",
    tabGifts: "Prezenty",
    tabVisit: "Wizyta",
    subtitle: "Karta członkowska",
    title: "NUAR CLUB",
    noVisit: "Brak aktywnej wizyty",
    nextVisit: "Najbliższa wizyta",
    route: "Trasa",
    noGifts: "Nie ma jeszcze prezentów",
    unopenedChests: "Skrzynie",
    openChest: "Otwórz skrzynię",
    availableRewards: "Dostępne prezenty",
    usedRewards: "Wykorzystane prezenty",
    visitsToChest: "wizyt do kolejnej skrzyni",
  },
  ru: {
    booking: "Записаться",
    cardInactive: "Карта неактивна",
    failed: "Не удалось открыть карту",
    loading: "Загрузка карты...",
    review: "Оставить отзыв",
    tabCard: "Карта",
    tabGifts: "Подарки",
    tabVisit: "Визит",
    subtitle: "Карта лояльности",
    title: "NUAR CLUB",
    noVisit: "Активной записи нет",
    nextVisit: "Ближайший визит",
    route: "Маршрут",
    noGifts: "Подарков пока нет",
    unopenedChests: "Сундуки",
    openChest: "Открыть сундук",
    availableRewards: "Доступные подарки",
    usedRewards: "Использованные подарки",
    visitsToChest: "визитов до следующего сундука",
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

async function openPublicChest(token, chestId) {
  const response = await fetch(
    `${BACKEND_URL}/api/public/loyalty/${encodeURIComponent(token)}/chests/${chestId}/open`,
    {
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || defaultStrings.failed);
  }
  return payload?.data ?? null;
}

async function fetchPublicLoyaltyDesign() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), DESIGN_TIMEOUT_MS);

  try {
    const response = await fetch(`${BACKEND_URL}/api/public/loyalty/design`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Design unavailable");
    }

    const payload = await response.json();
    return payload?.data?.tiers ? payload.data : null;
  } finally {
    window.clearTimeout(timeout);
  }
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

const getTierDesign = (design, tier) =>
  design?.tiers?.[tier] || fallbackTierDesign[tier] || fallbackTierDesign.MEMBER;

const getTierBackground = (style, tier) => {
  const localBackground = localTierBackgrounds[tier]
    ? `url("${localTierBackgrounds[tier]}")`
    : "";
  const remoteBackground = String(style?.backgroundImage || "").trim();

  if (remoteBackground && localBackground) {
    return `${localBackground}, ${remoteBackground}`;
  }

  return remoteBackground || localBackground || fallbackTierDesign.MEMBER.backgroundImage;
};

const getVisitWord = (language, count) => {
  if (language === "en") return count === 1 ? "visit" : "visits";
  if (language === "pl") return count === 1 ? "wizyta" : "wizyt";
  return "визитов";
};

function NuarClubCard({ card, design, target }) {
  const tier = String(card?.tier || "MEMBER").toUpperCase();
  const style = getTierDesign(design, tier);
  const TierIcon = tierIcons[tier] || ShieldCheck;
  const name = card?.displayName || "NUAR Member";
  const stamps = Math.min(6, Math.max(0, Number(card?.stamps) || 0));
  const visits = Math.max(0, Number(card?.lifetimeVisits) || 0);
  const isRewardReady = Boolean(card?.rewardAvailable) && stamps >= target;
  const giftLabel = getGiftLabel(card?.cardLanguage);
  const visitWord = getVisitWord(card?.cardLanguage, visits);
  const tierClass = tier === "ROYAL" ? "royal" : tier.toLowerCase();
  const footerEnd = tier === "ROYAL"
    ? (card?.cardLanguage === "pl" ? "status ekskluzywny" : card?.cardLanguage === "en" ? "exclusive status" : "эксклюзивный статус")
    : `${visits} ${visitWord}`;

  return (
    <article
      className={`nuar-public-card is-${tierClass}`}
      style={{
        "--physical-accent": style.accent,
        "--physical-bg": getTierBackground(style, tier),
        "--physical-engrave": style.accent,
        "--physical-glow": style.shine?.color || style.accent,
        "--physical-ink": style.accent,
        "--physical-ink-gradient": style.inkGradient,
        "--physical-shine-color": style.shine?.color || style.accent,
        "--physical-text": style.text,
      }}
    >
      <span aria-hidden="true" className="nuar-public-card__shine" />
      {TierIcon ? (
        <span className="nuar-public-card__mark" aria-label={style.badge || tier}>
          <TierIcon size={27} strokeWidth={1.65} />
        </span>
      ) : null}

      <span className="nuar-public-card__topline">
        <span className="nuar-public-card__brand">
          <strong>Nuar</strong>
          <small>{style.badge || tier}</small>
        </span>
      </span>

      <span className="nuar-public-card__signature">
        <small>{getLoyaltyLabel(card?.cardLanguage)}</small>
        {tier === "ROYAL" ? <Crown aria-hidden="true" className="nuar-public-card__signature-crown" size={28} strokeWidth={1.55} /> : null}
        <strong>{name}</strong>
      </span>

      <span className="nuar-public-card__bottomline">
        <span className="nuar-public-card__stamps" aria-label={`${stamps} / 6`} role="list">
          {Array.from({ length: 6 }).map((_, index) => {
            const isGift = index === 5;
            const filled = index < stamps;
            return (
              <i
                className={`${filled ? "is-filled" : ""} ${isGift ? "is-gift" : ""} ${isGift && isRewardReady ? "is-ready" : ""}`}
                key={index}
                role="listitem"
                title={isGift ? giftLabel : undefined}
              >
                {isGift ? <Gift size={13} /> : ""}
              </i>
            );
          })}
        </span>
        <span className="nuar-public-card__foot">
          <span className="nuar-public-card__progress">{stamps} / 6</span>
          <span>{footerEnd}</span>
        </span>
      </span>
    </article>
  );
}

export default function LoyaltyCardPage() {
  const { token = "" } = useParams();
  const [card, setCard] = useState(null);
  const [cardDesign, setCardDesign] = useState({ tiers: fallbackTierDesign });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(token));
  const [activeTab, setActiveTab] = useState("card");
  const [openingChestId, setOpeningChestId] = useState(null);

  const strings = stringsByLanguage[card?.cardLanguage] || defaultStrings;
  const target = Math.max(6, Number(card?.targetStamps) || 6);
  const stamps = Math.min(target, Math.max(0, Number(card?.stamps) || 0));
  const visitsLeft = Math.max(0, target - stamps);
  const chests = Array.isArray(card?.chests) ? card.chests : [];
  const rewards = Array.isArray(card?.rewards) ? card.rewards : [];
  const availableChests = chests.filter((chest) => chest.status === "available");
  const availableRewards = rewards.filter((reward) => reward.status === "available");
  const usedRewards = rewards.filter((reward) => reward.status === "redeemed");
  const giftsCount = availableChests.length + availableRewards.length;

  const refreshCard = () => fetchPublicLoyaltyCard(token).then((data) => setCard(data));

  const handleOpenChest = async (chestId) => {
    if (openingChestId) return;
    setOpeningChestId(chestId);
    try {
      await openPublicChest(token, chestId);
      await refreshCard();
    } finally {
      setOpeningChestId(null);
    }
  };

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

    fetchPublicLoyaltyDesign()
      .then((design) => {
        if (!cancelled && design?.tiers) {
          setCardDesign(design);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCardDesign({ tiers: fallbackTierDesign });
        }
      });

    return () => {
      cancelled = true;
    };
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
    <main className="loyalty-public-page">
      <section className="loyalty-public-shell">
        <div className="loyalty-public-stack">
          <div className="loyalty-public-heading">
            <span className="loyalty-public-emblem">
              <ShieldCheck size={18} />
            </span>
            <div>
              <h1 className="loyalty-public-title">
                <span>NUAR</span>
                <small>Club</small>
              </h1>
              <p className="loyalty-public-subtitle">{strings.subtitle}</p>
            </div>
          </div>

          {loading ? (
            <div className="loyalty-public-panel">
              {strings.loading}
            </div>
          ) : error || !card ? (
            <div className="loyalty-public-panel">
              <strong>{strings.failed}</strong>
              <span>
                {strings.cardInactive}
              </span>
            </div>
          ) : card && activeTab === "card" ? (
            <div className="loyalty-public-card-shell">
              <NuarClubCard card={card} design={cardDesign} target={target} />
            </div>
          ) : null}

          {card ? (
            <>
            <div className="loyalty-public-tabs">
              {[
                ["card", strings.tabCard],
                ["visit", strings.tabVisit],
                ["gifts", strings.tabGifts],
              ].map(([id, label]) => (
                <button
                  className={activeTab === id ? "is-active" : ""}
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                >
                  {label}
                  {id === "gifts" && giftsCount > 0 ? (
                    <span className="loyalty-public-tab-badge">{giftsCount}</span>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="loyalty-public-tab-stage" key={activeTab}>
              <div className="loyalty-public-panel">
                {activeTab === "card" ? (
                  <div className="loyalty-public-progress">
                    <div>
                      <span>{card.tier === "ROYAL" ? "ROYALTY" : card.tier}</span>
                      <strong>{stamps} / {target}</strong>
                    </div>
                    <div className="loyalty-public-progress-bar">
                      <span style={{ width: `${Math.min(100, (stamps / target) * 100)}%` }} />
                    </div>
                    <span>{visitsLeft} {strings.visitsToChest}</span>
                  </div>
                ) : null}

                {activeTab === "visit" ? (
                  card.upcomingVisit ? (
                    <div className="loyalty-public-visit">
                      <span className="loyalty-public-kicker">
                        <CalendarDays size={16} />
                        {strings.nextVisit}
                      </span>
                      <strong>{card.upcomingVisit.date || new Date(card.upcomingVisit.scheduledAt).toLocaleDateString()} {card.upcomingVisit.time || ""}</strong>
                      <span>{[card.upcomingVisit.serviceName, card.upcomingVisit.employeeName].filter(Boolean).join(" · ")}</span>
                      <a className="loyalty-public-text-link" href={MAPS_URL} rel="noreferrer" target="_blank">
                        <MapPin size={15} />
                        {strings.route}
                      </a>
                    </div>
                  ) : (
                    <div className="loyalty-public-visit">
                      <span>{strings.noVisit}</span>
                    </div>
                  )
                ) : null}

                {activeTab === "visit" ? (
                  <div className="loyalty-public-actions">
                    <a
                      className="loyalty-public-button is-primary"
                      href={card.bookingUrl || BOOKSY_URL}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {strings.booking}
                      <ExternalLink size={15} />
                    </a>
                    <a
                      className="loyalty-public-button is-secondary"
                      href={REVIEW_URL}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {strings.review}
                      <ExternalLink size={15} />
                    </a>
                  </div>
                ) : null}

                {activeTab === "gifts" ? (
                  <div className="loyalty-public-gifts">
                    <div>
                      <strong>{strings.unopenedChests}</strong>
                      {availableChests.length ? availableChests.map((chest) => (
                        <button
                          className="loyalty-public-gift-row"
                          disabled={openingChestId === chest.id}
                          key={chest.id}
                          type="button"
                          onClick={() => handleOpenChest(chest.id)}
                        >
                          <span>{chest.tier === "ROYAL" ? "ROYALTY" : chest.tier}</span>
                          <span>{openingChestId === chest.id ? "..." : strings.openChest}</span>
                        </button>
                      )) : <span>{strings.noGifts}</span>}
                    </div>
                    {availableRewards.length ? (
                      <div>
                        <strong>{strings.availableRewards}</strong>
                        {availableRewards.map((reward) => (
                          <span className="loyalty-public-gift-row" key={reward.id}>{reward.name}</span>
                        ))}
                      </div>
                    ) : null}
                    {usedRewards.length ? (
                      <div>
                        <strong>{strings.usedRewards}</strong>
                        {usedRewards.map((reward) => (
                          <span className="loyalty-public-gift-row is-muted" key={reward.id}>{reward.name}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
            </>
          ) : null}
        </div>
      </section>
    </main>
  );
}
