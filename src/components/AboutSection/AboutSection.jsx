import React from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaInstagram,
  FaFacebookF,
} from "react-icons/fa";
import SectionTitle from "../../ui/SectionTitle";
import {useAnimation, motion} from "framer-motion";
import {useInView} from "react-intersection-observer";

const teamColor = "text-goldMuted";

function AboutSection() {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    rootMargin: "-300px 0px",
  });

  React.useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: {duration: 0.8, delay: 0.5},
      });
    }
  }, [inView, controls]);
  return (
    <motion.section
      ref={ref}
      initial={{opacity: 0, y: 200}}
      animate={controls}
      className="custom-cont max-w-7xl mx-auto  px-4 sm:px-6 select-none">
      <SectionTitle>O nas</SectionTitle>

      <div
        id="about"
        className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20 mb-20">
        <div className="lg:w-1/2 text-mainColor leading-relaxed text-base sm:text-lg">
          <p className="mb-6">
            Mamy ponad 10 lat doświadczenia w pracy z ciałem i dbamy o
            indywidualne potrzeby każdego klienta. Nasze masaże łączą wiedzę z
            pasją do relaksu i zdrowia.
          </p>
          <p>
            Stawiamy na atmosferę spokoju, naturalne olejki i profesjonalne
            podejście, byś mógł w pełni odprężyć się i odzyskać energię.
          </p>
        </div>
        <div className="lg:w-1/2 w-full rounded-3xl overflow-hidden shadow-lg max-h-[400px] aspect-video">
          <img
            src="/about/about.webp"
            alt="about us"
            className="object-cover w-full h-full"
            loading="lazy"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <ContactCard title="Kontakt">
          <ContactItem
            icon={<FaPhoneAlt className={teamColor + " text-xl"} />}
            label="Telefon"
            value="+48 452 402 006"
            href="tel:+48452402006"
          />
          <ContactItem
            icon={<FaEnvelope className={teamColor + " text-xl"} />}
            label="Email"
            value="nuar.contact@gmail.com"
            href="mailto:nuar.contact@gmail.com"
          />
        </ContactCard>

        <ContactCard title="Lokalizacja">
          <ContactItem
            icon={<FaMapMarkerAlt className={teamColor + " text-xl"} />}
            label="Adres"
            value={"ul. Świętojerska 5/7, 00-236\nWarszawa"}
          />
          <ContactItem
            icon={<FaClock className={teamColor + " text-xl"} />}
            label="Godziny otwarcia"
            value={"Pon–Pt: 09:00–22:00\nSob–Nd: 10:00–20:00"}
          />
        </ContactCard>

        <ContactCard title="Media społecznościowe">
          <ContactItem
            icon={<FaInstagram className={teamColor + " text-xl"} />}
            label="Instagram"
            value="@nuar_massage"
            href="https://www.instagram.com/nuar_massage/"
          />
          <ContactItem
            icon={<FaFacebookF className={teamColor + " text-xl"} />}
            label="Facebook"
            value="NUAR Massage"
            href="https://www.facebook.com/nuarmassage/"
          />
        </ContactCard>
      </div>
    </motion.section>
  );
}

function ContactCard({title, children}) {
  return (
    <div className="border border-primaryColor/20  rounded-3xl p-6 shadow-xl backdrop-blur-sm h-full">
      <h3 className="text-lg font-semibold text-goldMuted tracking-wide mb-4 uppercase">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ContactItem({icon, label, value, href}) {
  return (
    <div className="flex items-start gap-3">
      <div>
        <div className="flex items-center space-x-2 mb-2 font-extrabold">
          <span className="text-primaryColor">{icon}</span>
          <span className="text-sm font-bold text-primaryColor uppercase tracking-wide">
            {label}
          </span>
        </div>
        {href ? (
          <a
            href={href}
            className="whitespace-pre-line hover:text-goldMuted transition"
            target="_blank"
            rel="noopener noreferrer">
            {value}
          </a>
        ) : (
          <p className="whitespace-pre-line">{value}</p>
        )}
      </div>
    </div>
  );
}

export default AboutSection;
