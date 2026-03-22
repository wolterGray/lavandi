import React, { useEffect, useState } from "react";
import CustomButton from "../../ui/CustomButton";
import { Link } from "react-scroll";
import { motion, AnimatePresence } from "framer-motion";
import LogoNuar from "../../ui/LogoNuar";
import { FaFacebookF, FaInstagram, FaRegCalendarAlt } from "react-icons/fa";
import { PiPhoneCallFill } from "react-icons/pi";

const langList = [
  { lang: "UA", iconPath: "/lang-icon/ua.svg" },
  { lang: "PL", iconPath: "/lang-icon/pl.svg" },
  { lang: "EN", iconPath: "/lang-icon/en.svg" },
];

const GOLD = "#D6B16A";

export default function Header({ navItems, setOpenModalRes }) {
  const [hovered, setHovered] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };

    if (mobileMenuOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  const listVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { ease: "easeOut", duration: 0.25 },
    },
  };

  return (
    <>
      {!mobileMenuOpen && (
        <div className="relative z-50 w-full">
          <motion.header
            initial={false}
            variants={{
              normalVisible: { opacity: 1, y: 0 },
              fixedVisible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: -20 },
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="font-crossorigin flex min-h-[72px] w-full items-center select-none py-3 sm:min-h-[82px] sm:py-4 lg:min-h-32 lg:py-0"
          >
            <div className="w-full">
              <div className="flex items-center justify-between gap-3 sm:gap-4 lg:grid lg:grid-cols-3 lg:items-center">
                {/* Логотип */}
                <div
                  className="shrink-0 lg:col-start-1 lg:justify-self-start"
                  style={{
                    width: "clamp(128px, 34vw, 200px)",
                  }}
                >
                  <LogoNuar className="block h-auto w-full" />
                </div>

                {/* Навигация десктоп */}
                <nav
                  className="hidden lg:col-start-2 lg:block"
                  aria-label="Główna nawigacja"
                >
                  <ul className="flex items-center justify-center space-x-6 whitespace-nowrap text-[11px] uppercase tracking-[0.18em] xl:space-x-8">
                    {navItems.map(({ label, path }, i) => (
                      <li
                        key={path}
                        className="relative"
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                      >
                        <Link
                          to={path}
                          smooth={true}
                          duration={500}
                          offset={-200}
                          onClick={() => setMobileMenuOpen(false)}
                          className="relative inline-block cursor-pointer px-1 py-1"
                        >
                          {label}
                          <span
                            className={`absolute bottom-0 left-1/2 h-px w-full -translate-x-1/2 origin-center transform bg-primaryColor transition-transform duration-300 ${
                              hovered === i ? "scale-x-100" : "scale-x-0"
                            }`}
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Правый блок */}
                <div className="flex items-center justify-end gap-3 sm:gap-4 lg:col-start-3 lg:justify-self-end lg:gap-8">
                  {/* Контакты только с md */}
                  <div className="hidden items-center gap-4 md:flex lg:gap-6">
                    <div className="flex items-center transition-transform duration-300 hover:scale-110 gap-2 whitespace-nowrap">
                      <FaRegCalendarAlt className="text-base text-primaryColor" />
                      <a
                        href="https://nuarr.booksy.com/a"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primaryColor   lg:text-[15px]"
                      >
                        Rezerwuj
                      </a>
                    </div>

                    <div className="flex items-center transition-transform duration-300 hover:scale-110 gap-2 whitespace-nowrap">
                      <PiPhoneCallFill className="text-base text-primaryColor" />
                      <a
                        href="tel:+48452402006"
                        className="text-sm text-primaryColor lg:text-[15px]"
                      >
                        Zadzwoń
                      </a>
                    </div>
                  </div>

                  {/* Бургер */}
                  <button
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-primaryColor transition-colors hover:bg-white/10 lg:hidden"
                    onClick={() => setMobileMenuOpen((p) => !p)}
                    aria-label="Menu"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Мини-контакты под хедером на мобилке */}
              <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/5 pt-2 md:hidden">
                <a
                  href="https://nuarr.booksy.com/a"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-2 text-[13px] text-primaryColor"
                >
                  <FaRegCalendarAlt className="shrink-0 text-sm" />
                  <span className="truncate">Rezerwuj</span>
                </a>

                <a
                  href="tel:+48452402006"
                  className="flex min-w-0 items-center gap-2 text-[13px] text-primaryColor"
                >
                  <PiPhoneCallFill className="shrink-0 text-sm" />
                  <span className="truncate">+48 452 402 006</span>
                </a>
              </div>
            </div>
          </motion.header>
        </div>
      )}

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              aria-label="Zamknij menu"
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.nav
              role="dialog"
              aria-modal="true"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="fixed inset-x-3 top-3 bottom-3 z-50 flex flex-col overflow-hidden rounded-[28px] bg-white/6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ring-1 ring-white/10 backdrop-blur-md sm:inset-x-4 sm:top-5 sm:bottom-5 sm:rounded-3xl"
            >
              {/* Верх */}
              <div className="flex items-center justify-between px-4 pt-4 sm:px-5 sm:pt-5">
                <div className="w-[118px] sm:w-[140px]">
                  <LogoNuar className="h-auto w-full" />
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Zamknij menu"
                  className="rounded-full bg-white/5 p-2 ring-1 ring-white/10 transition-colors hover:bg-white/10"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="text-white/80"
                  >
                    <path
                      strokeLinecap="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div
                className="mx-4 mt-4 h-px sm:mx-5"
                style={{
                  backgroundImage: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
                }}
              />

              {/* Навигация */}
              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="overflow-y-auto px-4 pt-5 pb-4 sm:px-5 sm:pt-6"
              >
                <div className="space-y-3 sm:space-y-4">
                  {navItems.map(({ label, path }) => (
                    <motion.li key={path} variants={itemVariants}>
                      <Link
                        to={path}
                        offset={path === "prices" ? -150 : -128}
                        smooth={true}
                        duration={500}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-[28px] font-light tracking-[0.02em] text-white/90 transition-colors hover:text-white sm:text-[32px]"
                      >
                        {label}
                      </Link>
                    </motion.li>
                  ))}
                </div>
              </motion.ul>

              {/* Низ */}
              <div className="mt-auto px-4 pb-5 text-center sm:px-5 sm:pb-6">
                <div className="mx-auto w-full max-w-sm">
                  <CustomButton text={"Rezerwuj"} onClick={setOpenModalRes} />
                </div>

                <div className="mt-4 flex items-center justify-center gap-4">
                  <SocialIcon
                    href="https://www.facebook.com/nuarmassage/"
                    ariaLabel="Facebook"
                    icon={<FaFacebookF className="h-4 w-4" />}
                  />
                  <SocialIcon
                    href="https://www.instagram.com/nuar_massage/"
                    ariaLabel="Instagram"
                    icon={<FaInstagram className="h-4 w-4" />}
                  />
                </div>

                <div className="mt-4 space-y-1 text-center">
                  <p className="text-xs text-white/65 sm:text-sm">
                    ul. Świętojerska 5/7
                  </p>
                  <a
                    href="tel:+48452402006"
                    className="inline-block text-xs text-white/55 transition-colors hover:text-white/80 sm:text-sm"
                  >
                    +48 452 402 006
                  </a>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SocialIcon({ href, ariaLabel, icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="group relative inline-grid h-10 w-10 place-items-center rounded-full bg-white/5 ring-1 ring-primaryColor/50 transition-colors hover:bg-white/[.08]"
    >
      <span className="sr-only">{ariaLabel}</span>

      <span className="text-primaryColor/80 transition-colors group-hover:text-white">
        {icon}
      </span>

      <span className="pointer-events-none absolute bottom-1 left-1/2 h-[2px] w-4 -translate-x-1/2 scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100" />
    </a>
  );
}