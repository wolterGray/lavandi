import { useEffect, useMemo, useState } from "react";
import { Copy, Crown, ExternalLink, Gem, ShieldCheck } from "lucide-react";
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

const tierAccent = {
  MEMBER: "#c9c2b5",
  SILVER: "#d9dee8",
  GOLD: "#d6bb7d",
  DIAMOND: "#f1f7ff",
  ROYAL: "#d8b35d",
};

const concepts = [
  {
    id: "black",
    label: "A",
    name: "Premium Black",
    note: "Matte graphite, thin gold line",
    className: "from-[#050505] via-[#101113] to-[#1b1b1e]",
    accent: "#d6bb7d",
    chip: "from-[#b69855] via-[#f0d894] to-[#8c743d]",
    pattern: "opacity-[0.18]",
  },
  {
    id: "gold",
    label: "B",
    name: "Luxury Gold",
    note: "Warm metal, private banking mood",
    className: "from-[#17100d] via-[#2b1d15] to-[#070606]",
    accent: "#f0d894",
    chip: "from-[#6d5429] via-[#f6d77d] to-[#ad8337]",
    pattern: "opacity-[0.28]",
  },
  {
    id: "diamond",
    label: "C",
    name: "Diamond Glass",
    note: "Cool glass, crystal light",
    className: "from-[#05080d] via-[#101923] to-[#07090f]",
    accent: "#e8f4ff",
    chip: "from-[#bfc9d8] via-[#ffffff] to-[#7f91a8]",
    pattern: "opacity-[0.32]",
  },
  {
    id: "royal",
    label: "D",
    name: "Royal Signature",
    note: "Black card, crown, gold type",
    className: "from-[#020202] via-[#080706] to-[#171008]",
    accent: "#d8b35d",
    chip: "from-[#5f461d] via-[#d8b35d] to-[#fff0a8]",
    pattern: "opacity-[0.2]",
    royal: true,
  },
];

const strings = {
  booking: "Zarezerwuj wizytę",
  cardInactive: "Karta jest nieaktywna",
  copied: "Link skopiowany",
  failed: "Nie udało się otworzyć karty",
  loading: "Ładowanie karty...",
  remaining: "Do nagrody pozostało",
  rewardAvailable: "Nagroda jest dostępna",
  subtitle: "Karta członkowska",
  title: "NUAR CLUB",
};

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
    throw new Error(payload?.error || strings.failed);
  }

  return payload?.data ?? null;
}

const getFallbackCardNumber = (token) => {
  const source = String(token || "nuar");
  const numbers = Array.from(source).reduce(
    (sum, char, index) => sum + char.charCodeAt(0) * (index + 17),
    0,
  );
  const first = String(numbers % 10000).padStart(4, "0");
  const second = String((numbers * 7 + 2458) % 10000).padStart(4, "0");
  const third = String((numbers * 13 + 9182) % 10000).padStart(4, "0");
  return `${first} • ${second} • ${third}`;
};

function BankChip({ chip }) {
  return (
    <div
      className={`relative h-9 w-12 overflow-hidden rounded-[9px] bg-gradient-to-br ${chip} shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28),0_8px_18px_rgba(0,0,0,0.22)]`}
    >
      <span className="absolute left-1/2 top-0 h-full w-px bg-black/20" />
      <span className="absolute left-0 top-1/2 h-px w-full bg-black/20" />
      <span className="absolute left-3 top-0 h-full w-px bg-white/18" />
      <span className="absolute right-3 top-0 h-full w-px bg-white/18" />
    </div>
  );
}

function PremiumCard({ card, concept, token }) {
  const tier = String(card?.tier || "MEMBER").toUpperCase();
  const tierLabel = tierLabels[tier] || tierLabels.MEMBER;
  const accent = tierAccent[tier] || concept.accent;
  const cardNumber = card?.cardNumber || getFallbackCardNumber(token);
  const name = card?.displayName || "NUAR Member";

  return (
    <article
      className={`group relative aspect-[1.586/1] w-full overflow-hidden rounded-[24px] bg-gradient-to-br ${concept.className} p-5 text-white shadow-[0_32px_90px_rgba(0,0,0,0.42)] ring-1 ring-white/10 transition duration-500 hover:-translate-y-1 hover:shadow-[0_40px_110px_rgba(0,0,0,0.5)]`}
      style={{ "--card-accent": accent }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.2),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(214,187,125,0.16),transparent_30%),linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.12)_45%,transparent_58%)] opacity-60" />
      <div
        className={`absolute -right-16 -top-12 h-48 w-48 rounded-full border border-white/20 ${concept.pattern}`}
      />
      <div className="absolute bottom-4 right-5 h-24 w-24 rounded-full border border-[color:var(--card-accent)]/40 opacity-20" />
      <div className="absolute inset-y-0 -left-1/2 w-1/2 rotate-12 bg-white/10 blur-2xl transition duration-700 group-hover:left-full" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <img
              src="/logo_nuar.PNG"
              alt="NUAR"
              className="h-9 w-auto object-contain opacity-95"
              loading="eager"
            />
            <p
              className="mt-2 text-[11px] font-semibold uppercase tracking-[0.28em]"
              style={{ color: accent }}
            >
              NUAR CLUB
            </p>
          </div>
          <div className="flex items-center gap-2 text-right">
            {concept.royal || tier === "ROYAL" ? (
              <Crown size={18} style={{ color: accent }} />
            ) : tier === "DIAMOND" ? (
              <Gem size={18} style={{ color: accent }} />
            ) : null}
            <span
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: accent }}
            >
              {tierLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <BankChip chip={concept.chip} />
          <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/58">
            Member ID
          </span>
        </div>

        <div>
          <p className="font-serif text-[28px] italic leading-tight tracking-wide text-white sm:text-[34px]">
            {name}
          </p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <p className="font-mono text-[15px] tracking-[0.22em] text-white/82 sm:text-[17px]">
              {cardNumber}
            </p>
            <p className="text-right text-[9px] font-semibold uppercase tracking-[0.16em] text-white/42">
              Not a payment card
            </p>
          </div>
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
  const selectedConcept = useMemo(() => {
    const tier = String(card?.tier || "").toUpperCase();
    const conceptId =
      tier === "ROYAL"
        ? "royal"
        : tier === "DIAMOND"
          ? "diamond"
          : tier === "GOLD"
            ? "gold"
            : "black";
    return concepts.find((concept) => concept.id === conceptId) || concepts[0];
  }, [card?.tier]);
  const target = Math.max(1, Number(card?.targetStamps) || 5);
  const stamps = Math.max(0, Number(card?.stamps) || 0);
  const remaining = Math.max(0, target - stamps);
  const progress = Math.min(100, Math.round((stamps / target) * 100));
  const updatedAt = useMemo(() => {
    const value = card?.lastTransactionAt || card?.updatedAt;
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("pl-PL");
  }, [card?.lastTransactionAt, card?.updatedAt]);

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
      setError(strings.failed);
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
          setError(strings.failed);
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
            <PremiumCard card={card} concept={selectedConcept} token={token} />
          )}
        </div>

        {card ? (
          <aside className="rounded-[24px] border border-white/10 bg-[#211628]/82 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-[0.18em] text-[#d6bb7d]/80">
                  Status
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
                Ostatnia aktualizacja: {updatedAt}
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
                {copied ? strings.copied : "Kopiuj link"}
              </button>
            </div>
          </aside>
        ) : null}
      </section>
    </main>
  );
}
