import React, {useEffect, useRef, useState} from "react";
import CustomButton from "../../ui/CustomButton";
import {Link} from "react-scroll";

import {motion} from "framer-motion";
import LogoNuar from "../../ui/LogoNuar";

const langList = [
  {lang: "UA", iconPath: "/lang-icon/ua.svg"},
  {lang: "PL", iconPath: "/lang-icon/pl.svg"},
  {lang: "EN", iconPath: "/lang-icon/en.svg"},
];

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
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [isFixed]);

  useEffect(() => {
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

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Spacer для компенсации высоты фиксированного хедера */}
      {isFixed && !mobileMenuOpen && <div style={{height: headerHeight}} />}

      {/* Хедер скрывается, если открыто мобильное меню */}
      {!mobileMenuOpen && (
        <div
          className={`w-full z-50 transition-all duration-300 ${
            isFixed
              ? "fixed top-0 left-0 bg-black/80 backdrop-blur-md shadow-xl rounded-full max-h-20 lg:max-h-32 mt-2"
              : "relative"
          }`}>
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
            className={`font-comforta  w-full min-h-16 lg:min-h-20 flex items-center font-extrabold select-none ${
              isFixed ? "px-10" : ""
            }`}>
            <div className="flex items-center justify-between w-full">
              {/* Левая часть */}

              <LogoNuar />

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

              {/* Правая часть */}
              <div className=" space-x-4 lg:space-x-8">
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
          </motion.header>
        </div>
      )}

      {/* Мобильное меню */}
      {mobileMenuOpen && (
        <motion.nav
          initial={{x: "100%"}}
          animate={{x: 0}}
          exit={{x: "100%"}}
          transition={{type: "tween", duration: 0.3}}
          className="lg:hidden fixed top-0 right-0 h-full w-4/5 max-w-xs bg-black text-white z-50 flex flex-col shadow-xl">
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

          <div className="mt-auto px-6 pb-10 w-full">
            <CustomButton className="w-full text-lg py-4">
              Zarezerwuj
            </CustomButton>
          </div>
        </motion.nav>
      )}
    </>
  );
}
