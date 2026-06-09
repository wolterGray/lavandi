import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "react-scroll";
import { AnimatePresence, motion } from "framer-motion";
import LogoNuar from "../../ui/LogoNuar";
import Button from "../../ui/Button";
import LanguageSwitcher from "../../ui/LanguageSwitcher";
import { useTranslation } from "../../i18n/LanguageProvider";
import { BOOKSY_URL, PHONE, PHONE_DISPLAY } from "../../constants/theme";

function NavLink({ label, path, className, onClick, linkToHome, offset = -80 }) {
  const base = `cursor-pointer ${className ?? ""}`;
  if (linkToHome) {
    return (
      <a href={`/#${path}`} className={base} onClick={onClick}>
        {label}
      </a>
    );
  }
  return (
    <Link to={path} smooth duration={600} offset={offset} className={base} onClick={onClick}>
      {label}
    </Link>
  );
}

export default function Header({ navItems, linkToHome = false }) {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setMobileMenuOpen(false); };
    if (mobileMenuOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  const headerBg =
    scrolled || mobileMenuOpen
      ? "bg-void/85 backdrop-blur-md border-b border-white/[0.06]"
      : "bg-transparent border-b border-transparent";

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${headerBg}`}>
        <div className="mx-auto flex max-w-content items-center justify-between gap-3 px-5 py-4 sm:px-6 lg:px-8 lg:py-5">
          <div className="w-[100px] shrink-0 sm:w-[120px]">
            {linkToHome ? (
              <RouterLink to="/"><LogoNuar className="block h-auto w-full" /></RouterLink>
            ) : (
              <LogoNuar className="block h-auto w-full" />
            )}
          </div>

          <nav className="hidden items-center gap-6 xl:gap-8 lg:flex" aria-label={t("nav.mainNav")}>
            {navItems.map(({ label, path }) => (
              <NavLink
                key={path}
                label={label}
                path={path}
                linkToHome={linkToHome}
                className="cursor-pointer text-[11px] font-medium uppercase tracking-[0.18em] text-stone transition hover:text-milk"
              />
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher className="hidden sm:flex" />
            <a
              href={`tel:${PHONE}`}
              className="hidden text-[11px] uppercase tracking-[0.14em] text-stone transition hover:text-milk xl:inline"
            >
              {PHONE_DISPLAY}
            </a>
            <Button href={BOOKSY_URL} size="sm" className="hidden md:inline-flex">
              {t("nav.book")}
            </Button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-milk lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={t("nav.menu")}
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              aria-label={t("nav.close")}
              className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="fixed inset-x-4 top-4 bottom-4 z-50 flex flex-col rounded-2xl border border-white/[0.06] bg-graphite p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <LogoNuar className="w-[100px]" />
                <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <button type="button" aria-label={t("nav.close")} onClick={() => setMobileMenuOpen(false)} className="rounded-full p-2 text-stone hover:text-milk">✕</button>
                </div>
              </div>

              <ul className="mt-10 flex flex-1 flex-col gap-6">
                {navItems.map(({ label, path }) => (
                  <li key={path}>
                    <NavLink label={label} path={path} linkToHome={linkToHome} onClick={() => setMobileMenuOpen(false)} className="font-display text-3xl text-milk" />
                  </li>
                ))}
              </ul>

              <div className="space-y-3 border-t border-white/[0.06] pt-6">
                <Button href={BOOKSY_URL} className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  {t("nav.bookVisit")}
                </Button>
                <a href={`tel:${PHONE}`} className="block text-center text-sm text-stone">{PHONE_DISPLAY}</a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
