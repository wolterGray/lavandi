import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { Link } from "react-scroll";
import LogoNuar from "../../ui/LogoNuar";

const GOLD = "#D6B16A";

export default function Footer({ navItems = [] }) {
  return (
    <footer className="relative bg-black text-white font-montserrat select-none">
      {/* тонкая золотая линия сверху */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ backgroundImage: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }}
      />

      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* 1: Лого + описание */}
        <div>
          <div className="w-32 sm:w-40 lg:w-48">
            <LogoNuar />
          </div>
          <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-sm">
            Premium salon masażu w Warszawie. Harmonia, relaks i troska o ciało.
          </p>

          {/* бейдж рейтинга */}
          <a
            href="https://booksy.com/pl-pl/262690_lavandi-studio-masazu_masaz_3_warszawa#ba_s=seo"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/70 hover:text-white transition-colors"
          >
            <span className="h-[1px] w-5" style={{ backgroundColor: `${GOLD}88` }} />
            5.0 / 5 na Booksy
          </a>
        </div>

        {/* 2: Навигация */}
        <nav aria-label="Główna nawigacja">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70 mb-4">
            Nawigacja
          </h3>
          <ul className="space-y-3 text-sm">
            {navItems.map(({ label, path }) => (
              <li key={path}>
                <Link
                  to={path}
                  smooth
                  duration={500}
                  offset={-200}
                  tabIndex={0}
                  className="text-white/70 hover:text-white transition-colors cursor-pointer underline-offset-4 hover:underline"
                  style={{ textDecorationColor: GOLD }}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 3: Контакт */}
        <address className="not-italic">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70 mb-4">
            Kontakt
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="https://maps.app.goo.gl/dgUhaixrhany5gm1A"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
              >
                ul. Świętojerska 5/7, Warszawa
              </a>
            </li>
            <li>
              <a href="tel:+48452402006" className="text-white/70 hover:text-white transition-colors">
                +48 452 402 006
              </a>
            </li>
            <li>
              <a href="mailto:nuar.contact@gmail.com" className="text-white/70 hover:text-white transition-colors">
                nuar.contact@gmail.com
              </a>
            </li>
          </ul>
        </address>

        {/* 4: Соцсети — БЕЗ золотого круга, золото только как акцент при ховере */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70 mb-4">
            Social Media
          </h3>
          <div className="flex items-center gap-4">
            <SocialIcon
              href="https://www.facebook.com/nuarmassage/"
              ariaLabel="Facebook NUAR"
              icon={<FaFacebookF className="w-4 h-4" />}
              gold={GOLD}
            />
            <SocialIcon
              href="https://www.instagram.com/nuar_massage/"
              ariaLabel="Instagram NUAR"
              icon={<FaInstagram className="w-4 h-4" />}
              gold={GOLD}
            />
          </div>
        </div>
      </div>

      {/* нижняя полоса */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-xs text-white/50 select-text">
          © {new Date().getFullYear()} NUAR. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, ariaLabel, icon, gold }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="group relative inline-grid place-items-center w-10 h-10 rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/[.08] transition-colors"
    >
      <span className="sr-only">{ariaLabel}</span>
      {/* сам значок — без золотого круга */}
      <span className="text-white/80 group-hover:text-white transition-colors">{icon}</span>
      {/* маленький золотой акцент-полоска снизу при ховере */}
      <span
        className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-4 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
      />
    </a>
  );
}
