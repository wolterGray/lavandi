import React, {useEffect, useRef, useState} from "react";
import CustomButton from "../../ui/CustomButton";
import {Link} from "react-scroll";
import LogoLavandi from "../../ui/LogoLavandi";
import {motion} from "framer-motion";

const langList = [
  {lang: "UA", iconPath: "/lang-icon/ua.svg"},
  {lang: "PL", iconPath: "/lang-icon/pl.svg"},
  {lang: "EN", iconPath: "/lang-icon/en.svg"},
];

export default function Header({navItems}) {
  const [hovered, setHovered] = useState(null);
  const [langSelect, setLangSelect] = useState("UA");
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  const headerRef = useRef(null);
  const [isFixed, setIsFixed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const currentLang = langList.find((l) => l.lang === langSelect);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY >= headerHeight && !isFixed) {
        setIsFixed(true);
      } else if (scrollY < headerHeight && isFixed) {
        setIsFixed(false);
      }
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

  return (
    <>
      {/* Spacer чтобы не прыгал контент при фиксации */}
      {isFixed && <div style={{height: headerHeight}} />}

      <motion.header
        ref={headerRef}
        initial={false}
        animate={isFixed ? "fixedVisible" : "normalVisible"}
        variants={{
          normalVisible: {opacity: 1, y: 0},
          fixedVisible: {opacity: 1, y: 0},
          hidden: {opacity: 0, y: -20},
        }}
        transition={{duration: 0.3, ease: "easeOut"}}
        className={`font-comforta w-full h-20 lg:h-32 flex items-center font-bold select-none z-20 transition-all duration-300 ${
          !mobileMenuOpen && isFixed
            ? "fixed top-0 left-0 bg-mainBg/50 shadow-xl shadow-primaryColor-500/30 backdrop-blur-md max-h-16 lg:max-h-20 rounded-full mt-2"
            : "relative bg-transparent"
        }`}>
        <div className="w-full h-full flex items-center justify-between px-4">
          {/* Левая часть */}
          <div className="flex items-center space-x-6 lg:space-x-16 overflow-hidden">
            <LogoLavandi />

            {/* Десктоп-навигация */}
            <nav className="hidden lg:block" aria-label="Główna nawigacja">
              <ul className="flex space-x-10 whitespace-nowrap">
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
                        className={`absolute bottom-0 left-1/2 h-px w-full bg-primaryColor-500 transition-transform duration-300 origin-center transform ${
                          hovered === i ? "scale-x-100" : "scale-x-0"
                        } -translate-x-1/2`}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Правая часть */}
          <div className="flex items-center space-x-4 lg:space-x-8">
            {/* Селектор языка (десктоп) */}
            {/* Закомментировал, чтобы не мешал, можешь раскомментировать */}
            {/* <div ref={langMenuRef} className="hidden lg:flex flex-col items-center relative">
              ...твой код селектора языка...
            </div> */}

            {/* Кнопка брони (десктоп) */}
            <div className="hidden lg:block">
              <CustomButton>Zarezerwuj</CustomButton>
            </div>

            {/* Бургер (мобильные) */}
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

        {/* Мобильное меню */}
        {mobileMenuOpen && (
          <motion.nav
            initial={{x: "100%"}}
            animate={{x: 0}}
            exit={{x: "100%"}}
            transition={{type: "tween", duration: 0.3}}
            className="lg:hidden fixed top-0 right-0 h-full w-4/5 max-w-xs bg-black text-white z-50 flex flex-col shadow-xl">
            {/* Zamknij */}
            <button
              className="self-end p-4"
              aria-label="Zamknij menu"
              onClick={() => setMobileMenuOpen(false)}>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Nawigacja */}
            <ul className="flex flex-col items-start gap-8 px-6 mt-6 text-2xl font-semibold">
              {navItems.map(({label, path}) => (
                <li key={path}>
                  <Link
                    to={path}
                    offset={path === "prices" ? -150 : -128}
                    smooth={true}
                    duration={500}
                    onClick={() => setMobileMenuOpen(false)}
                    className="cursor-pointer block">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Przycisk rezerwacji */}
            <div className="mt-auto px-6 pb-10 w-full">
              <CustomButton className="w-full text-lg py-4">
                Zarezerwuj
              </CustomButton>
            </div>
          </motion.nav>
        )}
      </motion.header>
    </>
  );
}
