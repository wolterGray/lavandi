import React, { useEffect, useMemo, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { AnimatePresence, motion } from "framer-motion";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

function PremiumStars({ rating = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: rating }).map((_, i) => (
        <AiFillStar key={i} className="h-3.5 w-3.5 text-primaryColor" />
      ))}
    </div>
  );
}

function ReviewCard({ name, text, rating = 5, position = "center" }) {
  const isCenter = position === "center";

  const variants = {
    center: {
      x: "-50%",
      y: 0,
      scale: 1.05,
      opacity: 1,
      filter: "blur(0px)",
      zIndex: 40,
    },
    backLeft: {
      x: "calc(-50% - 88px)",
      y: 42,
      scale: 0.84,
      opacity: 0.22,
      filter: "blur(4px)",
      zIndex: 10,
    },
    backRight: {
      x: "calc(-50% + 88px)",
      y: 42,
      scale: 0.84,
      opacity: 0.22,
      filter: "blur(4px)",
      zIndex: 10,
    },
  };

  return (
    <motion.div
      initial={{
        x: "-50%",
        y: 24,
        scale: 0.8,
        opacity: 0,
        filter: "blur(8px)",
      }}
      animate={variants[position]}
      exit={{
        x: "-50%",
        y: -10,
        scale: 0.78,
        opacity: 0,
        filter: "blur(8px)",
      }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="absolute left-1/2 top-0 w-[92%] max-w-[760px]"
      style={{ transformOrigin: "center center" }}
    >
      <div
        className={`
          relative overflow-hidden rounded-[30px] border p-5 md:p-6
          ${
            isCenter
              ? "border-white/20 bg-white/[0.14] shadow-[0_30px_100px_rgba(0,0,0,0.52)] backdrop-blur-2xl"
              : "border-white/5 bg-white/[0.025] shadow-none backdrop-blur-md"
          }
        `}
      >
        {isCenter && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_38%)]" />
            <div className="absolute -left-10 top-0 h-28 w-28 rounded-full bg-primaryColor/10 blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
          </>
        )}

        <div className="relative flex items-start gap-4">
          <div
            className={`
              flex h-12 w-12 shrink-0 items-center justify-center rounded-full
              text-xs font-semibold uppercase tracking-[0.12em]
              ${
                isCenter
                  ? "bg-primaryColor/25 text-white ring-1 ring-primaryColor/45"
                  : "bg-white/8 text-white/55 ring-1 ring-white/5"
              }
            `}
          >
            {getInitials(name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className={`text-[13px] font-semibold tracking-[0.12em] ${
                  isCenter ? "text-white" : "text-white/55"
                }`}
              >
                {name}
              </span>

              <span className="text-white/20">•</span>

              <PremiumStars rating={rating} />
            </div>

            <p
              className={`mt-3 ${
                isCenter
                  ? "text-[16px] leading-7 text-white/95 md:text-[18px] md:leading-8"
                  : "text-[14px] leading-6 text-white/45"
              }`}
            >
              {text}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ReviewsSection({ reviews = [] }) {
  const preparedReviews = useMemo(() => reviews, [reviews]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (preparedReviews.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % preparedReviews.length);
    }, 4200);

    return () => clearInterval(interval);
  }, [preparedReviews.length]);

  if (!preparedReviews.length) return null;

  const current = preparedReviews[activeIndex];
  const prev =
    preparedReviews[
      (activeIndex - 1 + preparedReviews.length) % preparedReviews.length
    ];
  const next =
    preparedReviews[
      (activeIndex + 1) % preparedReviews.length
    ];

  return (
    <section
      id="opinie"
      className="relative custom-cont select-none rounded-[28px] overflow-hidden py-14 md:py-[72px]"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[url('/reviews-img/rev.webp')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-secondaryColor/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-secondaryColor/50 via-secondaryColor/80 to-secondaryColor/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_42%)]" />
      </div>

      <div className="relative z-10 w-full">
        <ScrollAnimationWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <SectionTitle>Opinie</SectionTitle>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-[15px]">
              Prawdziwe wrażenia klientów po wizytach w naszym studio.
            </p>

            <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-2.5 text-white/90 backdrop-blur-sm">
              <PremiumStars rating={5} />
              <span className="text-sm uppercase tracking-[0.18em]">
                5.0 / 5 na Booksy
              </span>
              <span className="hidden text-white/40 sm:inline">•</span>
              <span className="text-sm text-white/65">50+ opinii</span>
              <a
                href="https://booksy.com/pl-pl/262690_lavandi-studio-masazu_masaz_3_warszawa#ba_s=seo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primaryColor underline decoration-primaryColor/50 underline-offset-4 hover:opacity-80"
              >
                Zobacz więcej
              </a>
            </div>
          </div>

          <div className="relative mx-auto mt-12 h-[320px] w-full max-w-5xl md:mt-16 md:h-[360px]">
            <AnimatePresence mode="popLayout">
              {prev && (
                <ReviewCard
                  key={`prev-${activeIndex}`}
                  {...prev}
                  position="backLeft"
                />
              )}

              {next && (
                <ReviewCard
                  key={`next-${activeIndex}`}
                  {...next}
                  position="backRight"
                />
              )}

              <ReviewCard
                key={`current-${activeIndex}`}
                {...current}
                position="center"
              />
            </AnimatePresence>
          </div>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
}