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
    <section id="team" className="custom-cont bg-secondaryColor/40 border-[1px] border-primaryColor/10 pb-16 select-none font-montserrat">
      <ScrollAnimationWrapper>
        <SectionTitle>Our Team</SectionTitle>
      </ScrollAnimationWrapper>

      {/* 2 колонки по центру, небольшой зазор */}
      <div className="mt-8 mx-auto w-full sm:w-fit grid grid-cols-1 sm:grid-cols-2 gap-5 place-items-center">
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
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group w-full max-w-[240px] text-center"   // компактнее карточка
    >
      {/* тонкий золотой кант */}
      <div
        className="relative rounded-lg p-[1px] overflow-hidden"
        style={{ backgroundImage: `linear-gradient(135deg, ${GOLD}77, transparent 40%, ${GOLD}33)` }}
      >
        <div className="relative rounded-[inherit] overflow-hidden bg-black">
          <img
            src={img}
            alt={name}
            loading="lazy"
            className="block w-full h-auto aspect-[4/5] object-cover transition-transform duration-500 group-hover:scale-[1.01]"
          />
          {/* лёгкий матовый слой */}
          <div className="absolute inset-0 bg-black/28 group-hover:bg-black/18 transition-colors duration-300" />

          {/* компактные уголки */}
          <span className="pointer-events-none absolute inset-0">
            <Corner x="left"  y="top" />
            <Corner x="right" y="top" />
            <Corner x="left"  y="bottom" />
            <Corner x="right" y="bottom" />
          </span>
        </div>
      </div>

      {/* подписи — Montserrat */}
      <h3 className="mt-3 font-cinzel text-[16px] sm:text-[17px] font-semibold tracking-[0.12em] uppercase text-white">
        {name}
      </h3>
      <p className="mt-0.5 text-xs text-primaryColor">{desc}</p>
    </motion.article>
  );
}

function Corner({ x, y }) {
  const horiz = x === "left" ? "left-2.5" : "right-2.5";
  const vert  = y === "top"  ? "top-2.5"  : "bottom-2.5";
  const size  = 34; // поменьше уголки
  return (
    <span className={`absolute ${horiz} ${vert} block`}>
      <span style={{ width: `${size}px`, height: 0, borderTop: `1px solid ${GOLD}66` }} />
      <span className="-mt-px" style={{ width: 0, height: `${size}px`, borderLeft: `1px solid ${GOLD}66` }} />
    </span>
  );
}
