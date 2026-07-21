import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "react-scroll";
import { AnimatePresence, motion } from "framer-motion";
import LogoNuar from "../../ui/LogoNuar";
import Container from "../../ui/Container";
import LanguageSwitcher from "../../ui/LanguageSwitcher";
import { useTranslation } from "../../i18n/LanguageProvider";
import BookVisitButton from "../../ui/BookVisitButton";
import { PHONE, PHONE_DISPLAY } from "../../constants/theme";

function NavLink({ label, path, to, className, onClick, linkToHome, offset = -80 }) {
  const base = `cursor-pointer ${className ?? ""}`;
  if (to) {
    return (
      <RouterLink to={to} className={base} onClick={onClick}>
        {label}
      </RouterLink>
    );
  }
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
    const onScroll = () => setScrolled(window.scrollY > 20);
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

  const showBar = scrolled || mobileMenuOpen;

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300 border-b border-border/40 bg-void/95 backdrop-blur-md shadow-header"
      >
        <Container className="flex items-center justify-between gap-3 py-3.5 lg:py-4">
          <div className="w-[92px] shrink-0 sm:w-[108px]">
            {linkToHome ? (
              <RouterLink to="/"><LogoNuar className="block h-auto w-full !mb-0" /></RouterLink>
            ) : (
              <LogoNuar className="block h-auto w-full !mb-0" />
            )}
          </div>

          <nav className="hidden items-center gap-8 lg:flex" aria-label={t("nav.mainNav")}>
            {navItems.map(({ label, path, to }) => (
              <NavLink
                key={to ?? path}
                label={label}
                path={path}
                to={to}
                linkToHome={linkToHome}
                className="font-outfit text-[11px] font-medium uppercase tracking-[0.18em] text-stone transition hover:text-milk"
              />
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher className="hidden sm:flex" />
            <BookVisitButton size="sm" className="hidden md:inline-flex">
              {t("nav.book")}
            </BookVisitButton>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-pill border border-border/60 text-milk lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={t("nav.menu")}
              aria-expanded={mobileMenuOpen}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </Container>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              aria-label={t("nav.close")}
              className="fixed inset-0 z-50 bg-void/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-void p-6 shadow-spa-hover"
            >
              <div className="flex items-center justify-between gap-3">
                <LogoNuar className="w-[92px] !mb-0" />
                <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <button type="button" aria-label={t("nav.close")} onClick={() => setMobileMenuOpen(false)} className="p-2 text-stone hover:text-milk">✕</button>
                </div>
              </div>
              <ul className="mt-10 flex flex-1 flex-col gap-4">
                {navItems.map(({ label, path, to }) => (
                  <li key={to ?? path}>
                    <NavLink label={label} path={path} to={to} linkToHome={linkToHome} onClick={() => setMobileMenuOpen(false)} className="font-outfit text-2xl font-medium uppercase tracking-[0.12em] text-milk" />
                  </li>
                ))}
              </ul>
              <div className="space-y-3 border-t border-border pt-6">
                <BookVisitButton className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  {t("nav.bookVisit")}
                </BookVisitButton>
                <a href={`tel:${PHONE}`} className="block text-center text-sm text-stone">{PHONE_DISPLAY}</a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
