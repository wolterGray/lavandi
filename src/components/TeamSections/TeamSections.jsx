import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import Button from "../../ui/Button";
import { useTranslation } from "../../i18n/LanguageProvider";

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
    <section id="team" className="section-padding bg-surface">
      <Container>
        <ScrollAnimationWrapper>
          <SectionTitle label={t("team.label")} description={t("team.description")}>{t("team.title")}</SectionTitle>
          <div className="spa-divider" />
        </ScrollAnimationWrapper>

        <div className="mx-auto mt-10 grid max-w-2xl gap-10 sm:grid-cols-2 sm:gap-12">
          {teamInfo.map((person, index) => (
            <ScrollAnimationWrapper key={person.id} delay={index * 0.1}>
              <article className="group text-center">
                <button type="button" onClick={() => setActiveId(person.id)} className="mx-auto block cursor-pointer" aria-label={t("team.learnMoreAbout", { name: person.name })}>
                  <div className="relative mx-auto aspect-[3/4] max-w-[260px] overflow-hidden rounded-full transition duration-700 ease-luxury">
                    <img src={person.img} alt={person.name} loading="lazy" className="h-full w-full object-contain object-bottom transition duration-700 ease-luxury group-hover:scale-[1.02]" />
                  </div>
                </button>
                <h3 className="mt-5 font-display text-2xl text-milk">{person.name}</h3>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-gold">{t(person.roleKey)}</p>
                <Button variant="ghost" size="sm" className="mt-4" onClick={() => setActiveId(person.id)}>
                  {t("team.learnMore")}
                </Button>
              </article>
            </ScrollAnimationWrapper>
          ))}
        </div>
      </Container>

      <AnimatePresence>
        {activeMember && (
          <>
            <motion.button type="button" aria-label={t("team.close")} className="fixed inset-0 z-50 bg-void/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveId(null)} />
            <motion.div role="dialog" aria-modal="true" aria-labelledby="team-modal-title" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="fixed inset-x-4 top-[10%] z-50 mx-auto max-h-[80vh] max-w-lg overflow-y-auto rounded-card bg-surface p-6 sm:p-8">
              <div className="flex items-start gap-5">
                <img src={activeMember.img} alt={activeMember.name} className="h-24 w-20 shrink-0 object-contain object-bottom" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">{t(activeMember.roleKey)}</p>
                  <h3 id="team-modal-title" className="mt-1 font-display text-2xl text-milk">{activeMember.name}</h3>
                </div>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-stone">{t(`team.members.${activeMember.id}.bio`)}</p>
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{t("team.specialties")}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {(t(`team.members.${activeMember.id}.specialties`) ?? []).map((item) => (
                    <li key={item} className="rounded-pill border border-border/10 px-3 py-1 text-xs text-stone">{item}</li>
                  ))}
                </ul>
              </div>
              <Button variant="secondary" size="sm" className="mt-8 w-full" onClick={() => setActiveId(null)}>{t("team.close")}</Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
