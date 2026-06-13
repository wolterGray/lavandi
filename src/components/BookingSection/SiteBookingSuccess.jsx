import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import Button from "../../ui/Button";

function fireBookingConfetti() {
  const base = {
    origin: { y: 0.65 },
    zIndex: 1000,
  };

  confetti({
    ...base,
    particleCount: 90,
    spread: 72,
    startVelocity: 42,
  });

  window.setTimeout(() => {
    confetti({
      ...base,
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
    });
    confetti({
      ...base,
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
    });
  }, 180);
}

export default function SiteBookingSuccess({ onClose, t }) {
  useEffect(() => {
    fireBookingConfetti();
  }, []);

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative overflow-hidden rounded-card border border-gold/30 bg-void/90 p-8 text-center shadow-2xl backdrop-blur-md sm:p-10"
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      role="status"
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-gold/20 to-transparent"
      />
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-3xl">
        🎉
      </div>
      <h3 className="relative mt-5 font-display text-2xl text-milk sm:text-3xl">
        {t("booking.form.successTitle")}
      </h3>
      <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
        {t("booking.form.successMessage")}
      </p>
      <div className="relative mt-8 flex justify-center">
        <Button size="lg" type="button" variant="outlineLight" onClick={onClose}>
          {t("booking.form.successClose")}
        </Button>
      </div>
    </motion.div>
  );
}
