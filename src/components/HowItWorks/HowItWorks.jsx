import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import SectionTitle from "../../ui/SectionTitle";
import { GOLD } from "../../constants/theme";

const steps = [
  {
    number: "01",
    title: "Wybierz usługę",
    description:
      "Przejrzyj ofertę masaży i wybierz długość zabiegu dopasowaną do Twoich potrzeb.",
  },
  {
    number: "02",
    title: "Zarezerwuj termin",
    description:
      "Kliknij „Rezerwuj” i wybierz dogodny dzień oraz godzinę w Booksy — bez dzwonienia.",
  },
  {
    number: "03",
    title: "Przyjdź i odpocznij",
    description:
      "Przy ul. Świętojerskiej 5/7 czeka na Ciebie spokojna atmosfera i profesjonalna opieka.",
  },
];

export default function HowItWorks() {
  return (
    <section id="jak-to-dziala" className="custom-cont px-4 sm:px-6">
      <ScrollAnimationWrapper>
        <SectionTitle>Jak to działa</SectionTitle>
        <p className="mx-auto -mt-6 mb-10 max-w-2xl text-center text-sm leading-7 text-white/60 sm:text-base">
          Trzy proste kroki — od wyboru masażu do pełnego relaksu w naszym studio.
        </p>

        <ol className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3 sm:gap-8">
          {steps.map((step, index) => (
            <li
              key={step.number}
              className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
            >
              {index < steps.length - 1 && (
                <span
                  className="pointer-events-none absolute -right-4 top-1/2 hidden h-px w-8 -translate-y-1/2 sm:block"
                  style={{ backgroundColor: `${GOLD}55` }}
                  aria-hidden="true"
                />
              )}
              <span
                className="font-cinzel text-3xl font-semibold tracking-widest"
                style={{ color: GOLD }}
              >
                {step.number}
              </span>
              <h3 className="mt-4 text-lg font-medium text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-white/60">{step.description}</p>
            </li>
          ))}
        </ol>
      </ScrollAnimationWrapper>
    </section>
  );
}
