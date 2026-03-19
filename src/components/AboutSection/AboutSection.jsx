import React from "react";
import SectionTitle from "../../ui/SectionTitle";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section className="custom-cont mx-auto px-4 py-12 select-none sm:px-6 sm:py-16 lg:py-20">
      <SectionTitle>O nas</SectionTitle>

      <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        {/* ТЕКСТ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="order-2 lg:order-1"
        >
          <h3 className="max-w-xl text-2xl font-medium leading-tight text-white sm:text-3xl md:text-4xl lg:text-[42px]">
            Cisza. Spokój. Oddech.
          </h3>

          <p className="mt-5 max-w-lg text-sm leading-7 text-white/60 sm:mt-6 sm:text-base sm:leading-8">
            Tworzymy przestrzeń, w której możesz zatrzymać się na chwilę.
            Każdy masaż to nie tylko technika — to doświadczenie, które
            przywraca równowagę ciała i umysłu.
          </p>

          <p className="mt-4 text-xs tracking-[0.2em] text-white/50 sm:text-sm">
            NUAR • Warszawa
          </p>
        </motion.div>

        {/* ФОТО */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="relative order-1 lg:order-2"
        >
          <img
            src="/about/about.PNG"
            alt="NUAR massage"
            className="h-[280px] w-full rounded-2xl object-cover sm:h-[360px] md:h-[440px] lg:h-[500px]"
          />

          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/40 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}