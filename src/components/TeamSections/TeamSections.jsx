import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SiteImage from "../../ui/SiteImage";
import Container from "../../ui/Container";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import Button from "../../ui/Button";
import { useTranslation } from "../../i18n/LanguageProvider";
import { useContent } from "../../context/ContentProvider";

export default function TeamSections() {
  const { t, lang } = useTranslation();
  const { team, getLocaleSection, getTeamMemberContent } = useContent();
  const teamCopy = getLocaleSection(lang, "team", t("team"));
  const [activeId, setActiveId] = useState(null);
  const activeMember = team.find((p) => p.id === activeId);
  const activeContent = activeMember ? getTeamMemberContent(lang, activeMember, t) : null;

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
          <SectionTitle label={teamCopy.label} description={teamCopy.description}>{teamCopy.title}</SectionTitle>
          <div className="spa-divider" />
        </ScrollAnimationWrapper>

        <div className="mx-auto mt-10 grid max-w-2xl gap-10 sm:grid-cols-2 sm:gap-12">
          {team.map((person, index) => {
            const member = getTeamMemberContent(lang, person, t);
            return (
              <ScrollAnimationWrapper key={person.id} delay={index * 0.1}>
                <article className="group text-center">
                  <button type="button" onClick={() => setActiveId(person.id)} className="mx-auto block cursor-pointer" aria-label={t("team.learnMoreAbout", { name: person.name })}>
                    <div className="relative mx-auto aspect-[3/4] max-w-[260px] overflow-hidden rounded-card ring-1 ring-border/30 transition duration-700 ease-luxury group-hover:ring-gold/25">
                      <SiteImage
                        src={person.img}
                        alt={person.name}
                        fill
                        className="object-cover object-top group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    </div>
                  </button>
                  <h3 className="mt-5 font-display text-2xl text-milk">{person.name}</h3>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-gold">{member.roleLabel}</p>
                  <Button variant="ghost" size="sm" className="mt-4" onClick={() => setActiveId(person.id)}>
                    {t("team.learnMore")}
                  </Button>
                </article>
              </ScrollAnimationWrapper>
            );
          })}
        </div>
      </Container>

      <AnimatePresence>
        {activeMember && activeContent && (
          <>
            <motion.button type="button" aria-label={t("team.close")} className="fixed inset-0 z-50 bg-void/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveId(null)} />
            <motion.div role="dialog" aria-modal="true" aria-labelledby="team-modal-title" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="fixed inset-x-4 top-[10%] z-50 mx-auto max-h-[80vh] max-w-lg overflow-y-auto rounded-card bg-surface p-6 sm:p-8">
              <div className="flex items-start gap-5">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-card ring-1 ring-border/30">
                  <SiteImage
                    src={activeMember.img}
                    alt={activeMember.name}
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">{activeContent.roleLabel}</p>
                  <h3 id="team-modal-title" className="mt-1 font-display text-2xl text-milk">{activeMember.name}</h3>
                </div>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-stone">{activeContent.bio}</p>
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{t("team.specialties")}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {(activeContent.specialties ?? []).map((item) => (
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
