import React, {useEffect, useRef, useState} from "react";
import CustomButton from "../../ui/CustomButton";
import {Link} from "react-scroll";
import {motion, AnimatePresence} from "framer-motion";
import LogoNuar from "../../ui/LogoNuar";
import {FaFacebookF, FaInstagram} from "react-icons/fa";

const langList = [
  {lang: "UA", iconPath: "/lang-icon/ua.svg"},
  {lang: "PL", iconPath: "/lang-icon/pl.svg"},
  {lang: "EN", iconPath: "/lang-icon/en.svg"},
];

const GOLD = "#D6B16A";

export default function Header({navItems}) {
  const [hovered, setHovered] = useState(null);
  const [langSelect] = useState("UA");
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  const headerRef = useRef(null);
  const [isFixed, setIsFixed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const currentLang = langList.find((l) => l.lang === langSelect);

  useEffect(() => {
    if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
  }, [isFixed]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY >= headerHeight && !isFixed) setIsFixed(true);
      else if (scrollY < headerHeight && isFixed) setIsFixed(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headerHeight, isFixed]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
  }, [mobileMenuOpen]);

  // Закрытие по Esc
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  // анимации списка
  const listVariants = {
    hidden: {opacity: 0},
    show: {opacity: 1, transition: {staggerChildren: 0.06}},
  };
  const itemVariants = {
    hidden: {opacity: 0, y: 10},
    show: {opacity: 1, y: 0, transition: {ease: "easeOut", duration: 0.25}},
  };

  return (
    <>
      {/* Spacer для компенсации высоты фиксированного хедера */}
      {isFixed && !mobileMenuOpen && <div style={{height: headerHeight}} />}

      {/* Хедер скрывается, если открыто мобильное меню */}
      {!mobileMenuOpen && (
        <div
          className={`w-full z-50 transition-all duration-300 ${
            isFixed
              ? "fixed top-0 left-0 bg-secondaryColor/50 backdrop-blur-md shadow-xl rounded-full max-h-20 lg:max-h-32 mt-2 "
              : "relative"
          }`}>
          <motion.header
            ref={headerRef}
            initial={false}
            variants={{
              normalVisible: {opacity: 1, y: 0},
              fixedVisible: {opacity: 1, y: 0},
              hidden: {opacity: 0, y: -20},
            }}
            transition={{duration: 0.3, ease: "easeOut"}}
            className={`font-montserrat w-full min-h-16 lg:min-h-20 flex items-center font-medium select-none ${
              isFixed ? "px-10" : ""
            }`}>
            <div className="flex items-center justify-between w-full">
              {/* Логотип (адаптивная ширина) */}
              <div
                className="shrink-0 transition-[width] duration-300 ease-out"
                style={{
                  width: isFixed
                    ? "clamp(120px, 28vw, 160px)"
                    : "clamp(150px, 32vw, 200px)",
                }}>
                <LogoNuar className="block w-full h-auto" />
              </div>

              {/* Навигация (десктоп) */}
              <nav className="hidden lg:block" aria-label="Główna nawigacja">
                <ul className="flex space-x-10 whitespace-nowrap uppercase text-sm">
                  {navItems.map(({label, path}, i) => (
                    <li
                      key={path}
                      className="relative"
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}>
                      <Link
                        to={path}
                        smooth={true}
                        duration={500}
                        offset={-200}
                        onClick={() => setMobileMenuOpen(false)}
                        className="inline-block px-1 py-1 relative cursor-pointer">
                        {label}
                        <span
                          className={`absolute bottom-0 left-1/2 h-px w-full bg-primaryColor transition-transform duration-300 origin-center transform ${
                            hovered === i ? "scale-x-100" : "scale-x-0"
                          } -translate-x-1/2`}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Правый блок */}
              <div className="space-x-4 lg:space-x-8">
                <div className="hidden lg:block">
                  <CustomButton>Zarezerwuj</CustomButton>
                </div>

                {/* Бургер (мобилки) */}
                <button
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen((p) => !p)}
                  aria-label="Меню">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.header>
        </div>
      )}

      {/* МОБИЛЬНОЕ МЕНЮ — премиум */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* затемнённый фон с блюром — закрывает по клику */}
            <motion.button
              aria-label="Zamknij menu"
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* стеклянная карточка-меню */}
            <motion.nav
              role="dialog"
              aria-modal="true"
              initial={{y: 40, opacity: 0}}
              animate={{y: 0, opacity: 1}}
              exit={{y: 40, opacity: 0}}
              transition={{type: "spring", stiffness: 280, damping: 28}}
              className="fixed z-50 inset-x-4 top-6 bottom-6 rounded-3xl overflow-hidden
                         bg-white/6 backdrop-blur-md ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                         flex flex-col">
              {/* верхняя панель */}
              <div className="flex items-center justify-between px-5 pt-5">
                <div className="w-[140px]">
                  <LogoNuar className="w-full h-auto" />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Zamknij menu"
                  className="rounded-full p-2 bg-white/5 hover:bg-white/10 ring-1 ring-white/10">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="text-white/80">
                    <path
                      strokeLinecap="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* разделительная тонкая золотая линия */}
              <div
                className="mx-5 mt-4 h-px"
                style={{
                  backgroundImage: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
                }}
              />

              {/* список навигации со стаггером */}
              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="px-5 pt-6 space-y-4 overflow-y-auto">
                {navItems.map(({label, path}) => (
                  <motion.li key={path} variants={itemVariants}>
                    <Link
                      to={path}
                      offset={path === "prices" ? -150 : -128}
                      smooth={true}
                      duration={500}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-2xl font-montserrat font-light tracking-[0.02em] text-white/90 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              {/* низ карточки */}
              <div className="mt-auto px-5 pb-6">
                {/* кнопка Booksy */}
                <a
                  href="https://booksy.com/pl-pl/262690_lavandi-studio-masazu_masaz_3_warszawa#ba_s=seo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center">
                  <CustomButton
                    className="w-full text-base py-3 rounded-full text-black font-semibold"
                    style={{backgroundColor: GOLD}}>
                    Zarezerwuj w Booksy
                  </CustomButton>
                </a>

                {/* соцсети */}
                <div className="mt-4 flex items-center justify-center gap-4">
                  <SocialIcon
                    href="https://www.facebook.com/nuarmassage/"
                    ariaLabel="Facebook"
                    icon={<FaFacebookF className="w-4 h-4" />}
                  />
                  <SocialIcon
                    href="https://www.instagram.com/nuar_massage/"
                    ariaLabel="Instagram"
                    icon={<FaInstagram className="w-4 h-4" />}
                  />
                </div>

                {/* маленькая строка контактов */}
                <p className="mt-3 text-center text-xs text-white/55">
                  ul. Świętojerska 5/7 • +48 452 402 006
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// аккуратные иконки в круге, обводка золотом на ховере
function SocialIcon({href, ariaLabel, icon}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="group relative inline-grid place-items-center w-10 h-10 rounded-full bg-white/5 ring-1 ring-primaryColor/50 hover:bg-white/[.08] transition-colors">
      <span className="sr-only">{ariaLabel}</span>
      {/* сам значок — без золотого круга */}
      <span className="text-primaryColor/80 group-hover:text-white transition-colors">
        {icon}
      </span>
      {/* маленький золотой акцент-полоска снизу при ховере */}
      <span className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-4 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </a>
  );
}
