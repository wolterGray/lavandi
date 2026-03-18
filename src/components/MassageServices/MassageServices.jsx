import React from "react";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";

function MassageServices({ services = [] }) {
  const half = Math.ceil(services.length / 2);
  const leftColumn = services.slice(0, half);
  const rightColumn = services.slice(half);

  return (
    <section className="custom-cont" id="services">
      <ScrollAnimationWrapper>
        <div className="mx-auto mb-10 text-center sm:mb-12 md:mb-14">
          <SectionTitle>Usługi</SectionTitle>

          <p className="mx-auto mt-3 max-w-2xl px-2 text-sm leading-6 text-[#c9b39a] sm:text-[15px] sm:leading-7 md:mt-4 md:px-0 md:text-base">
            Odkryj wybrane rytuały masażu stworzone dla relaksu, regeneracji
            i harmonii ciała.
          </p>
        </div>

        <div className="mx-auto grid grid-cols-1 gap-x-10 gap-y-0 md:grid-cols-2 xl:gap-x-24">
          <div>
            {leftColumn.map((service) => (
              <ServiceRow key={service.title} service={service} />
            ))}
          </div>

          <div>
            {rightColumn.map((service) => (
              <ServiceRow key={service.title} service={service} />
            ))}
          </div>
        </div>
      </ScrollAnimationWrapper>
    </section>
  );
}

function ServiceRow({ service }) {
  return (
    <article className="border-b border-[#3b2d21] py-3 sm:py-4 md:py-5">
      <div className="flex items-start justify-between gap-3 sm:gap-4 md:gap-6">
        <div className="min-w-0 flex-1">
          <h3 className="font-cinzel text-[16px] uppercase leading-tight tracking-[0.03em] text-[#f4eadf] sm:text-[18px] md:text-[20px]">
            {service.title}
          </h3>

          <p className="mt-2 font-cormorant text-[16px] leading-5 text-[#d6b38b] opacity-80 sm:mt-3 sm:text-[17px] sm:leading-6 md:text-[18px]">
            {service.desc}
          </p>
        </div>

        <div className="shrink-0 pt-1">
          <div className="h-[56px] w-[56px] overflow-hidden rounded-[12px] border border-[#3b2d21] bg-[#120d09] sm:h-[64px] sm:w-[64px] md:h-[76px] md:w-[76px] md:rounded-[14px]">
            <img
              src={service.img}
              alt={service.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export default MassageServices;