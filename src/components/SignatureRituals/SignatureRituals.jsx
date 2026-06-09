import { Link } from "react-router-dom";
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
    <section id="signature" className="section-padding">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle label={t("signature.label")} description={t("signature.description")}>{t("signature.title")}</SectionTitle>
          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            {signatureServices.map((service, index) => (
              <Link key={service.slug} to={`/uslugi/${service.slug}`} className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-graphite transition duration-500 hover:border-white/10">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={service.img} alt={service.title} loading={index === 0 ? "eager" : "lazy"} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold">{t("services.from")} {getFromPrice(service)} {t("common.pln")}</p>
                  <h3 className="mt-2 font-display text-2xl text-milk">{service.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone">{service.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </ScrollAnimationWrapper>
      </Container>
    </section>
  );
}
