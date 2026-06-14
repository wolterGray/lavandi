import { Link } from "react-router-dom";
import SiteImage from "../../ui/SiteImage";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import { useTranslation } from "../../i18n/LanguageProvider";
import { SIGNATURE_SLUGS } from "../../constants/theme";

function getFromPrice(service) {
  const idx = service.time.indexOf(60) >= 0 ? service.time.indexOf(60) : 0;
  const price = service.price[idx];
  return service.discount ? Math.round(price * (1 - service.discount / 100)) : price;
}

export default function SignatureRituals({ services = [] }) {
  const { t } = useTranslation();
  const signatureServices = SIGNATURE_SLUGS.map((slug) => services.find((s) => s.slug === slug)).filter(Boolean);

  return (
    <section id="signature" className="section-padding bg-cream">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle label={t("signature.label")} description={t("signature.description")}>
            {t("signature.title")}
          </SectionTitle>
          <div className="spa-divider" />
        </ScrollAnimationWrapper>

        <div className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
          {signatureServices.map((service, index) => (
            <ScrollAnimationWrapper key={service.slug} delay={index * 0.1}>
              <Link to={`/uslugi/${service.slug}`} className="group relative block spa-card">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <SiteImage
                    src={service.img}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-[1.04]"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-void/55 to-void/10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-void/95 via-void/35 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-left sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">
                    {t("services.from")} {getFromPrice(service)} {t("common.pln")}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-white">{service.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/80">{service.desc}</p>
                </div>
              </Link>
            </ScrollAnimationWrapper>
          ))}
        </div>
      </Container>
    </section>
  );
}
