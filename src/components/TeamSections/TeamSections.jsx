import React from "react";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import SectionTitle from "../../ui/SectionTitle";
import { motion } from "framer-motion";

const GOLD = "#D6B16A";

export default function TeamSections() {
  const teamInfo = [
    { name: "Olha",      img: "/team/2.webp", desc: "Masażystka" },
    { name: "Volodymyr", img: "/team/1.webp", desc: "Administrator" },
  ];

  return (
    <section
      id="team"
      className="custom-cont bg-secondaryColor/40 border-[1px] border-primaryColor/10 pb-12 select-none font-montserrat"
    >
      <ScrollAnimationWrapper>
        <SectionTitle>Our Team</SectionTitle>
      </ScrollAnimationWrapper>

      {/* сетка адаптивная */}
      <div className="mx-auto w-full sm:w-fit grid grid-cols-1 sm:grid-cols-2 gap-10 place-items-center">
        {teamInfo.map((p, i) => (
          <TeamCard key={i} {...p} />
        ))}
      </div>
    </section>
  );
}

function TeamCard({ name, img, desc }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="group flex flex-col items-center text-center"
    >
      {/* круглое фото с золотым обводом */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full p-[2px]"
           style={{ background: `linear-gradient(135deg, ${GOLD}, transparent 70%)` }}
      >
        <img
          src={img}
          alt={name}
          loading="lazy"
          className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* подписи */}
      <h3 className="mt-4 font-cinzel text-lg sm:text-xl font-semibold tracking-[0.12em] uppercase text-white">
        {name}
      </h3>
      <p className="mt-1 text-sm sm:text-base text-primaryColor">{desc}</p>
    </motion.article>
  );
}
