import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "react-scroll";
import LogoNuar from "../../ui/LogoNuar";
import Container from "../../ui/Container";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import { BOOKSY_URL, SOCIAL } from "../../constants/theme";
import { useContent } from "../../context/ContentProvider";

export default function Footer({ navItems = [], linkToHome = false }) {
  const { t } = useTranslation();
  const { contact } = useContent();

  return (
    <footer className="bg-spa-footer text-white/80">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <ScrollAnimationWrapper>
            <div>
              <div className="w-28"><LogoNuar /></div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed">{t("footer.description")}</p>
              <a href={contact.booksyUrl || BOOKSY_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.12em] text-gold transition hover:text-white">
                {t("footer.booksy")}
              </a>
            </div>
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper delay={0.08}>
            <nav aria-label={t("footer.navLabel")}>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gold">{t("footer.menu")}</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {navItems.map(({ label, path, to }) => (
                  <li key={to ?? path}>
                    {to ? (
                      <RouterLink to={to} className="transition hover:text-white">{label}</RouterLink>
                    ) : linkToHome ? (
                      <a href={`/#${path}`} className="transition hover:text-white">{label}</a>
                    ) : (
                      <Link to={path} smooth duration={600} offset={-96} className="cursor-pointer transition hover:text-white">{label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper delay={0.16}>
            <address className="not-italic">
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gold">{t("footer.contact")}</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href={contact.mapsLink} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">{contact.street}, {contact.city}</a></li>
                <li><a href={`tel:${contact.phone}`} className="transition hover:text-white">{contact.phoneDisplay}</a></li>
                <li><a href={`mailto:${contact.email}`} className="transition hover:text-white">{contact.email}</a></li>
              </ul>
            </address>
          </ScrollAnimationWrapper>
          <ScrollAnimationWrapper delay={0.24}>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gold">{t("footer.social")}</h3>
              <div className="mt-4 flex gap-3">
                <SocialIcon href={SOCIAL.facebook} label="Facebook" icon={<FaFacebookF />} />
                <SocialIcon href={SOCIAL.instagram} label="Instagram" icon={<FaInstagram />} />
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </Container>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} NUAR. {t("footer.copyright")}
      </div>
    </footer>
  );
}

function SocialIcon({ href, label, icon }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition hover:border-gold hover:text-gold">
      {icon}
    </a>
  );
}
