import { FaInstagram } from "react-icons/fa";
import SiteImage from "../../ui/SiteImage";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import SectionTitle from "../../ui/SectionTitle";
import { SOCIAL } from "../../constants/theme";
import services from "../../data/services.json";

const feedImages = services.slice(0, 6);

export default function InstagramSection() {
  return (
    <section id="instagram" className="custom-cont px-4 sm:px-6">
      <ScrollAnimationWrapper>
        <SectionTitle>Instagram</SectionTitle>
        <p className="mx-auto -mt-6 mb-8 max-w-2xl text-center text-sm leading-7 text-white/60 sm:text-base">
          Zobacz atmosferę studia, efekty zabiegów i codzienność NUAR na Instagramie.
        </p>

        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {feedImages.map((service) => (
            <a
              key={service.slug}
              href={SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10"
              aria-label={`${service.title} — zobacz na Instagramie NUAR`}
            >
              <SiteImage
                src={service.img}
                alt={service.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                <span className="text-xs uppercase tracking-[0.18em] text-white/90">
                  @nuar_massage
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm text-white/85 transition hover:border-primaryColor/40 hover:text-primaryColor"
          >
            <FaInstagram className="text-lg text-primaryColor" />
            Obserwuj @nuar_massage
          </a>
        </div>
      </ScrollAnimationWrapper>
    </section>
  );
}
