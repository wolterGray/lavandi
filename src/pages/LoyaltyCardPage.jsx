import { useEffect, useMemo, useState } from "react";
import { Copy, ExternalLink, Gift, ShieldCheck } from "lucide-react";
import { useParams } from "react-router-dom";

const BACKEND_URL =
  import.meta.env.VITE_CRM_BACKEND_URL || "https://api.nuarr.pl";

const strings = {
  booking: "Zarezerwuj wizytę",
  cardInactive: "Karta jest nieaktywna",
  copied: "Link skopiowany",
  failed: "Nie udało się otworzyć karty",
  loading: "Ładowanie karty...",
  remaining: "Do nagrody pozostało",
  rewardAvailable: "Nagroda jest dostępna",
  stamps: "Wizyty",
  subtitle: "Twoja karta lojalnościowa",
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

export default function LoyaltyCardPage() {
  const { token = "" } = useParams();
  const [card, setCard] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(token));

  const publicUrl = typeof window === "undefined" ? "" : window.location.href;
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
    <main className="min-h-screen bg-[#1e1324] px-5 py-10 text-[#f8f0df]">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[460px] flex-col justify-center">
        <div className="rounded-[28px] border border-[#d6bb7d]/20 bg-[#2a1b31]/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#d6bb7d]/12 text-[#d6bb7d]">
              <ShieldCheck size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-[0.08em] text-[#d6bb7d]">
                {strings.title}
              </h1>
              <p className="mt-1 text-sm text-[#f8f0df]/68">{strings.subtitle}</p>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-[#f8f0df]/72">
              {strings.loading}
            </div>
          ) : error || !card ? (
            <div className="mt-8 rounded-2xl border border-[#d6bb7d]/20 bg-[#d6bb7d]/8 p-5">
              <strong className="block text-base text-[#d6bb7d]">{strings.failed}</strong>
              <span className="mt-1 block text-sm text-[#f8f0df]/68">
                {strings.cardInactive}
              </span>
            </div>
          ) : (
            <>
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
                <small className="text-xs uppercase tracking-[0.16em] text-[#d6bb7d]/80">
                  Karta
                </small>
                <strong className="mt-1 block text-2xl">{card.displayName}</strong>
              </div>

              <div className="mt-6 grid place-items-center">
                <div className="grid h-44 w-44 place-items-center rounded-full border border-[#d6bb7d]/24 bg-[#d6bb7d]/10">
                  <div className="text-center">
                    <strong className="block text-4xl text-[#d6bb7d]">
                      {stamps}/{target}
                    </strong>
                    <span className="text-sm text-[#f8f0df]/64">{strings.stamps}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full bg-[#d6bb7d]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-5 flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Gift className="mt-0.5 shrink-0 text-[#d6bb7d]" size={20} />
                <div>
                  <strong className="block">
                    {card.rewardAvailable
                      ? strings.rewardAvailable
                      : `${strings.remaining}: ${remaining}`}
                  </strong>
                  <span className="mt-1 block text-sm text-[#f8f0df]/62">
                    Ostatnia aktualizacja: {updatedAt}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
            </>
          )}
        </div>
      </section>
    </main>
  );
}
