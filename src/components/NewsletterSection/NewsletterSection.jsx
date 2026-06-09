import { useState } from "react";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import SectionTitle from "../../ui/SectionTitle";
import { EMAIL } from "../../constants/theme";

const ENDPOINT = import.meta.env.VITE_NEWSLETTER_ENDPOINT;

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!ENDPOINT) {
      window.location.href = `mailto:${EMAIL}?subject=Newsletter NUAR&body=Proszę dodać mój email: ${encodeURIComponent(email)}`;
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, source: "nuarr.pl" }),
      });

      if (!response.ok) throw new Error("submit failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="promocje" className="custom-cont px-4 sm:px-6">
      <ScrollAnimationWrapper>
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-8 sm:px-8 sm:py-10">
          <SectionTitle>Promocje & newsletter</SectionTitle>
          <p className="mx-auto -mt-6 mb-6 max-w-xl text-center text-sm leading-7 text-white/65 sm:text-base">
            Zostaw email, a powiadomimy Cię o sezonowych rabatach i specjalnych ofertach NUAR.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Adres email
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Twój adres email"
              className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/30 px-5 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-primaryColor/50"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-full bg-primaryColor px-6 py-3 text-sm font-semibold text-secondaryColor transition hover:opacity-90 disabled:opacity-60"
            >
              {status === "loading" ? "Wysyłanie..." : "Zapisz się"}
            </button>
          </form>

          {status === "success" && (
            <p className="mt-4 text-center text-sm text-primaryColor">
              Dziękujemy! Email został zapisany.
            </p>
          )}
          {status === "error" && (
            <p className="mt-4 text-center text-sm text-red-300">
              Nie udało się wysłać formularza. Napisz do nas: {EMAIL}
            </p>
          )}
          {!ENDPOINT && (
            <p className="mt-4 text-center text-xs text-white/45">
              Brak skonfigurowanego endpointu — formularz otworzy wiadomość email.
            </p>
          )}
        </div>
      </ScrollAnimationWrapper>
    </section>
  );
}
