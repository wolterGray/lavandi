import {useEffect, useState} from "react";

const GA_ID = "G-NYM3P4FJJE"; // твой GA4 ID
const LS_KEY = "nuar_consent"; // ключ в localStorage: 'granted' | 'denied'

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  // показать баннер, если нет сохранённого выбора
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (!saved) setVisible(true);
    // если ранее соглашался — дожимаем конфиг (на случай хард-рефреша)
    if (saved === "granted" && window.gtag) {
      window.gtag("consent", "update", {
        ad_storage: "granted",
        analytics_storage: "granted",
      });
      window.gtag("config", GA_ID); // отправит первый page_view
    }
  }, []);

  const accept = () => {
    localStorage.setItem(LS_KEY, "granted");
    if (window.gtag) {
      window.gtag("consent", "update", {
        ad_storage: "granted",
        analytics_storage: "granted",
      });
      window.gtag("config", GA_ID); // первый page_view после согласия
      window.gtag("event", "consent_accept", {source: "banner"});
    }
    setVisible(false);
  };

  const deny = () => {
    localStorage.setItem(LS_KEY, "denied");
    if (window.gtag) {
      window.gtag("consent", "update", {
        ad_storage: "denied",
        analytics_storage: "denied",
      });
      window.gtag("event", "consent_deny", {source: "banner"});
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[1000] px-4 pb-4">
      <div
        className="mx-auto max-w-3xl rounded-2xl border bg-[#0d0510]/95 text-white shadow-2xl backdrop-blur
                   border-white/10">
        <div className="p-5 md:p-6">
          <h3 className="text-[15px] font-semibold text-[#D6B16A] tracking-wide mb-2">
            Pliki cookie & analityka
          </h3>
          <p className="text-sm text-white/80 leading-relaxed">
            Używamy plików cookie do analityki (Google Analytics), aby ulepszać
            działanie strony. Możesz zaakceptować lub odrzucić analitykę.
            Niezbędne pliki cookie działają zawsze.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={accept}
              className="inline-flex items-center justify-center rounded-full px-6 py-2.5
                         font-semibold text-white bg-[#E94560] hover:bg-[#B21E3F]
                         transition shadow-[0_6px_24px_rgba(233,69,96,.45)]">
              Akceptuję
            </button>

            <button
              onClick={deny}
              className="inline-flex items-center justify-center rounded-full px-6 py-2.5
                         font-semibold text-white/90 bg-white/10 hover:bg-white/[0.15]
                         transition border border-white/10">
              Tylko niezbędne
            </button>

            <a
              href="/polityka-prywatnosci"
              className="sm:ml-auto text-sm underline decoration-[#D6B16A]/70 underline-offset-4
                         hover:text-[#D6B16A]">
              Polityka prywatności
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
