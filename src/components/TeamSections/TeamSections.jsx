import React from "react";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import SectionTitle from "../../ui/SectionTitle";
import { motion } from "framer-motion";

const GOLD = "#D6B16A";

const teamInfo = [
  {
    id: 1,
    name: "Olha",
    img: "/team/2.png",
    role: "Top Master",
    category: "top",
  },
  {
    id: 2,
    name: "Anna",
    img: "/team/1.png",
    role: "Master",
    category: "master",
  },
  {
    id: 3,
    name: "Volodymyr",
    img: "/team/3.png",
    role: "Administrator",
    category: "admin",
  },
];

export default function TeamSections() {
  return (
    <section id="team" className="relative overflow-hidden py-12 sm:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl opacity-10"
          style={{ background: GOLD }}
        />
      </div>

      <ScrollAnimationWrapper>
        <SectionTitle>Our Team</SectionTitle>
      </ScrollAnimationWrapper>

      <div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-y-14 px-4 sm:mt-14 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-16 sm:px-6 lg:grid-cols-3 lg:gap-x-10">
        {teamInfo.map((person, index) => (
          <TeamCard
            key={person.id}
            name={person.name}
            img={person.img}
            role={person.role}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

function TeamCard({ name, img, role, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.08 }}
      className="group relative flex flex-col items-center text-center"
    >
      <div className="relative flex h-[220px] w-full items-end justify-center sm:h-[380px] lg:h-[320px]">
        <div
          className="absolute bottom-6 h-28 w-28 rounded-full blur-3xl opacity-20 transition-all duration-500 group-hover:opacity-30 sm:bottom-8 sm:h-36 sm:w-36"
          style={{ background: GOLD }}
        />

        <img
          src={img}
          alt={name}
          loading="lazy"
          className="
            relative z-10
            max-h-full max-w-full object-contain
            drop-shadow-[0_20px_50px_rgba(0,0,0,0.45)]
            transition-all duration-500
            group-hover:-translate-y-1 group-hover:scale-[1.02]
          "
        />
      </div>

      <div className="mt-5 px-2 sm:mt-6">
        <h3 className="font-cinzel text-[20px] font-semibold uppercase tracking-[0.16em] text-white sm:text-[24px] lg:text-[28px]">
          {name}
        </h3>

        <div className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-[#D6B16A] to-transparent opacity-80" />

        <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-white/50 sm:text-xs sm:tracking-[0.28em]">
          {role}
        </p>
      </div>
    </motion.article>
  );
}