import { useState } from "react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "react-scroll";
import LogoNuar from "../../ui/LogoNuar";
import Button from "../../ui/Button";
import Container from "../../ui/Container";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import { BOOKSY_URL, EMAIL, PHONE, PHONE_DISPLAY, SOCIAL, STUDIO } from "../../constants/theme";

const ENDPOINT = import.meta.env.VITE_NEWSLETTER_ENDPOINT;

export default function Footer({ navItems = [], linkToHome = false }) {
  const { t } = useTranslation();

  return (
    <footer className="bg-spa-footer text-white/80">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <ScrollAnimationWrapper>
            <div>
              <div className="w-28"><LogoNuar /></div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed">{t("footer.description")}</p>
              <a href={BOOKSY_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.12em] text-gold transition hover:text-white">
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
                <li><a href={STUDIO.mapsLink} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">ul. Świętojerska 5/7, Warszawa</a></li>
                <li><a href={`tel:${PHONE}`} className="transition hover:text-white">{PHONE_DISPLAY}</a></li>
                <li><a href={`mailto:${EMAIL}`} className="transition hover:text-white">{EMAIL}</a></li>
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
      <NewsletterBand />
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} NUAR. {t("footer.copyright")}
      </div>
    </footer>
  );
}

function NewsletterBand() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ENDPOINT) {
      window.location.href = `mailto:${EMAIL}?subject=Newsletter NUAR&body=Email: ${encodeURIComponent(email)}`;
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, source: "nuarr.pl" }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="border-t border-white/10 py-10">
      <Container>
        <ScrollAnimationWrapper>
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">{t("footer.newsletter")}</p>
            <p className="mt-2 font-display text-xl text-white">{t("footer.newsletterTitle")}</p>
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("footer.emailPlaceholder")}
                aria-label={t("footer.emailAria")}
                className="min-w-0 flex-1 rounded-pill border border-white/15 bg-milk/5 px-5 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-gold"
              />
              <Button type="submit" size="sm" disabled={status === "loading"}>
                {status === "loading" ? t("footer.subscribing") : t("footer.subscribe")}
              </Button>
            </form>
            {status === "success" && <p className="mt-3 text-sm">{t("footer.subscribeSuccess")}</p>}
            {status === "error" && <p className="mt-3 text-sm">{t("footer.subscribeError", { email: EMAIL })}</p>}
          </div>
        </ScrollAnimationWrapper>
      </Container>
    </div>
  );
}

function SocialIcon({ href, label, icon }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition hover:border-gold hover:text-gold">
      {icon}
    </a>
  );
}
