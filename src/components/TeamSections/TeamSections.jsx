import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import Button from "../../ui/Button";
import { useTranslation } from "../../i18n/LanguageProvider";
import { COLORS } from "../../constants/theme";

const teamInfo = [
  { id: "olha", name: "Olha", img: "/team/1.png", roleKey: "team.roles.topMaster" },
  { id: "max", name: "Max", img: "/team/3.png", roleKey: "team.roles.master" },
];

export default function TeamSections() {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState(null);
  const activeMember = teamInfo.find((p) => p.id === activeId);

  useEffect(() => {
    document.body.style.overflow = activeId ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setActiveId(null); };
    if (activeId) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeId]);

  return (
    <section id="team" className="section-padding border-t border-white/[0.06]">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle label={t("team.label")} description={t("team.description")}>{t("team.title")}</SectionTitle>
          <div className="mx-auto grid max-w-2xl gap-10 sm:grid-cols-2 sm:gap-12">
            {teamInfo.map((person) => (
              <article key={person.id} className="group text-center">
                <button
                  type="button"
                  onClick={() => setActiveId(person.id)}
                  className="mx-auto block cursor-pointer"
                  aria-label={t("team.learnMoreAbout", { name: person.name })}
                >
                  <div className="relative mx-auto aspect-[3/4] max-w-[280px] overflow-hidden rounded-2xl">
                    <img
                      src={person.img}
                      alt={person.name}
                      loading="lazy"
                      className="h-full w-full object-contain object-bottom transition duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                </button>
                <h3 className="mt-5 font-display text-2xl text-milk">{person.name}</h3>
                <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted">{t(person.roleKey)}</p>
                <div className="mx-auto mt-4 h-px w-10" style={{ backgroundColor: COLORS.gold }} />
                <Button variant="ghost" size="sm" className="mt-4" onClick={() => setActiveId(person.id)}>
                  {t("team.learnMore")}
                </Button>
              </article>
            ))}
          </div>
        </ScrollAnimationWrapper>
      </Container>

      <AnimatePresence>
        {activeMember && (
          <>
            <motion.button
              type="button"
              aria-label={t("team.close")}
              className="fixed inset-0 z-50 bg-void/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveId(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="team-modal-title"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              className="fixed inset-x-4 top-[10%] z-50 mx-auto max-h-[80vh] max-w-lg overflow-y-auto rounded-2xl border border-white/[0.06] bg-graphite p-6 sm:p-8"
            >
              <div className="flex items-start gap-5">
                <img
                  src={activeMember.img}
                  alt={activeMember.name}
                  className="h-24 w-20 shrink-0 object-contain object-bottom"
                />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold">{t(activeMember.roleKey)}</p>
                  <h3 id="team-modal-title" className="mt-1 font-display text-2xl text-milk">
                    {activeMember.name}
                  </h3>
                </div>
              </div>

              <p className="mt-6 text-sm leading-relaxed text-stone">
                {t(`team.members.${activeMember.id}.bio`)}
              </p>

              <div className="mt-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{t("team.specialties")}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {(t(`team.members.${activeMember.id}.specialties`) ?? []).map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-white/[0.08] px-3 py-1 text-xs text-stone"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Button variant="secondary" size="sm" className="mt-8 w-full" onClick={() => setActiveId(null)}>
                {t("team.close")}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
