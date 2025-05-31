import React from "react";
import SectionTitle from "../../ui/SectionTitle";
import CarouselServices from "./CarouselServices";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";

function MassageServices({services}) {
  return (
    <section id="services">
      <ScrollAnimationWrapper>
        <SectionTitle>Usługi</SectionTitle>
        <CarouselServices services={services} />
      </ScrollAnimationWrapper>
    </section>
  );
}

export default MassageServices;
