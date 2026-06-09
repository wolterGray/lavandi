import { useState } from "react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { Link } from "react-scroll";
import LogoNuar from "../../ui/LogoNuar";
import Button from "../../ui/Button";
import Container from "../../ui/Container";
import { useTranslation } from "../../i18n/LanguageProvider";
import {
  BOOKSY_URL,
  EMAIL,
  PHONE,
  PHONE_DISPLAY,
  SOCIAL,
  STUDIO,
} from "../../constants/theme";
import services from "../../data/services.json";

const ENDPOINT = import.meta.env.VITE_NEWSLETTER_ENDPOINT;

export default function Footer({ navItems = [], linkToHome = false }) {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/[0.06] bg-graphite">
      <InstagramBand />
      <NewsletterBand />
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="w-28">
              <LogoNuar />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone">{t("footer.description")}</p>
            <a
              href={BOOKSY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-xs uppercase tracking-[0.16em] text-gold hover:text-champagne"
            >
              {t("footer.booksy")}
            </a>
          </div>

          <nav aria-label={t("footer.navLabel")}>
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">{t("footer.menu")}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {navItems.map(({ label, path }) => (
                <li key={path}>
                  {linkToHome ? (
                    <a href={`/#${path}`} className="text-stone transition hover:text-milk">
                      {label}
                    </a>
                  ) : (
                    <Link
                      to={path}
                      smooth
                      duration={600}
                      offset={-80}
                      className="cursor-pointer text-stone transition hover:text-milk"
                    >
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <address className="not-italic">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">{t("footer.contact")}</h3>
            <ul className="mt-4 space-y-3 text-sm text-stone">
              <li>
                <a
                  href={STUDIO.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-milk"
                >
                  ul. Świętojerska 5/7, Warszawa
                </a>
              </li>
              <li>
                <a href={`tel:${PHONE}`} className="transition hover:text-milk">
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="transition hover:text-milk">
                  {EMAIL}
                </a>
              </li>
            </ul>
          </address>

          <div>
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted">{t("footer.social")}</h3>
            <div className="mt-4 flex gap-3">
              <SocialIcon href={SOCIAL.facebook} label="Facebook" icon={<FaFacebookF />} />
              <SocialIcon href={SOCIAL.instagram} label="Instagram" icon={<FaInstagram />} />
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/[0.06] py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} NUAR. {t("footer.copyright")}
      </div>
    </footer>
  );
}

function InstagramBand() {
  const { t } = useTranslation();
  const images = services.slice(0, 4);

  return (
    <div className="border-b border-white/[0.06] py-10">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{t("footer.instagram")}</p>
            <p className="mt-2 font-display text-2xl text-milk">@nuar_massage</p>
          </div>
          <Button href={SOCIAL.instagram} variant="secondary" size="sm">
            {t("footer.follow")}
          </Button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {images.map((s) => (
            <a
              key={s.slug}
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square overflow-hidden rounded-xl border border-white/[0.06]"
            >
              <img src={s.img} alt="" className="h-full w-full object-cover opacity-90 transition hover:opacity-100" loading="lazy" />
            </a>
          ))}
        </div>
      </Container>
    </div>
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
    <div className="border-b border-white/[0.06] py-10">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{t("footer.newsletter")}</p>
          <p className="mt-2 font-display text-xl text-milk">{t("footer.newsletterTitle")}</p>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("footer.emailPlaceholder")}
              aria-label={t("footer.emailAria")}
              className="min-w-0 flex-1 rounded-full border border-white/[0.06] bg-void px-5 py-3 text-sm text-milk placeholder:text-muted outline-none focus:border-gold/40"
            />
            <Button type="submit" size="sm" disabled={status === "loading"}>
              {status === "loading" ? t("footer.subscribing") : t("footer.subscribe")}
            </Button>
          </form>
          {status === "success" && <p className="mt-3 text-sm text-gold">{t("footer.subscribeSuccess")}</p>}
          {status === "error" && (
            <p className="mt-3 text-sm text-stone">{t("footer.subscribeError", { email: EMAIL })}</p>
          )}
        </div>
      </Container>
    </div>
  );
}

function SocialIcon({ href, label, icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.06] text-stone transition hover:border-gold/30 hover:text-milk"
    >
      {icon}
    </a>
  );
}
