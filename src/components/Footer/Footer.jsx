import {FaFacebookF, FaInstagram, FaTwitter} from "react-icons/fa";
import LogoLavandi from "../../ui/LogoLavandi";
import {Link} from "react-scroll";

export default function Footer({navItems}) {
  return (
    <footer className="text-white py-12 px-6 select-none bg-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Kolumna 1: Logo i opis */}
        <div>
          <div className="w-32 sm:w-40 lg:w-48">
            <LogoLavandi />
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
            Premium salon masażu w Warszawie. Harmonia, relaks i troska o ciało.
          </p>
        </div>

        {/* Kolumna 2: Nawigacja */}
        <nav aria-label="Główna nawigacja">
          <h3 className="text-lg font-semibold mb-4">Nawigacja</h3>
          <ul className="space-y-3 text-sm text-neutral-400">
            {navItems.map(({label, path}) => (
              <li key={path}>
                <Link
                  to={path}
                  smooth={true}
                  duration={500}
                  offset={-200}
                  className="hover:text-primaryColor-500 transition-colors duration-300"
                  tabIndex={0}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Kolumna 3: Kontakt */}
        <address className="not-italic">
          <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li>
              <a
                href="https://maps.app.goo.gl/dgUhaixrhany5gm1A"
                target="_blank"
                rel="noopener noreferrer"
                className=" hover:text-primaryColor-500 transition-colors duration-300 ">
                ul. Świętojerska 5/7, Warszawa
              </a>
            </li>
            <li>
              <a
                href="tel:+48452402006"
                className="hover:text-primaryColor-500 transition-colors duration-300">
                +48 452-402-006
              </a>
            </li>
            <li>
              <a
                href="mailto:lavandi.warsaw@gmail.com"
                className="hover:text-primaryColor-500 transition-colors duration-300">
                lavandi.warsaw@gmail.com
              </a>
            </li>
          </ul>
        </address>

        {/* Kolumna 4: Media społecznościowe */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Jesteśmy w social media
          </h3>
          <div className="flex space-x-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primaryColor-500 hover:text-primaryColor-300 transition-colors duration-300 text-2xl">
              <FaFacebookF />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primaryColor-500 hover:text-primaryColor-300 transition-colors duration-300 text-2xl">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-neutral-700 pt-6 text-center text-xs text-neutral-500 select-text">
        © {new Date().getFullYear()} Lavandi. Wszelkie prawa zastrzeżone.
      </div>
    </footer>
  );
}
