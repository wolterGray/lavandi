import {AiFillStar} from "react-icons/ai";
import {Swiper, SwiperSlide} from "swiper/react";
import {Pagination, Autoplay} from "swiper/modules";
import {motion} from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";
import SectionTitle from "../../ui/SectionTitle";
import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";

const GOLD = "#D6B16A";
const EGGPLANT = "#100613";

const reviews = [
  { name: "Mateusz K.", text: "Polecam:)", rating: 5 },
  { name: "Marcin R.", text: "polecam :)", rating: 5 },
  {
    name: "Konstantin L.",
    text: "Авторский массаж супер! Очень чуткий и качественный массаж, как и люблю был пожёстче. Рекомендую!",
    rating: 5,
  },
  { name: "Valentyn T.", text: "Amazing!", rating: 5 },
  {
    name: "Nina M.",
    text: "Bardzo dziękuję Pani Olha za masaż! Jej ręce to prawdziwa magia. Czuję lekkość w całym ciele i mam energię na cały dzień. Olha jest mistrzynią w tym, co robi ❤️",
    rating: 5,
  },
  {
    name: "Misha",
    text: "Skuteczny masaż sportowy – precyzyjna praca na przeciążonych strukturach, odczuwalna poprawa już po pierwszej sesji.",
    rating: 5,
  },
  {
    name: "Kasia K.",
    text: "Pani Helga jest fenomenalna. Bardzo polecam i dziękuję za wspaniały masaż",
    rating: 5,
  },
  { name: "Wiktor H.", text: "Jak zwykle super", rating: 5 },
  { name: "Małgorzata W.", text: "Polecam!", rating: 5 },
  { name: "Mateusz K.", text: "Udana wizyta, polecam :)", rating: 5 },
  {
    name: "Ксения Б.",
    text: "Лучшее место в Варшаве . Оля просто богиня ♥️ рекомендую",
    rating: 5,
  },
  { name: "Mateusz Ł.", text: "Udana wizyta", rating: 5 },
  {
    name: "Alisa P.",
    text: "Ola mega pozytywna i super profesjonalna masażystka 😍😍😍 jeden z najlepszych masażów w moim życiu, polecam serdecznie 🧡🧡🧡",
    rating: 5,
  },
  {
    name: "Martyna C.",
    text: "Bardzo dobry, mocny masaż. Pani Helga wie co robi i robi to świetnie! Efekt jest widoczny od razu. Na pewno jeszcze skorzystam ⭐",
    rating: 5,
  },
  {
    name: "Magdalena A.",
    text: "Fantastyczny masaż, świetne zrozumienie problemu przez Panią Helge, przyjemna muzyka i relaksacyjny zapach, polecam !!!",
    rating: 5,
  },
  { name: "Kuba B.", text: "Wspaniały masaż!", rating: 5 },
  {
    name: "Pawel C.",
    text: "Doskonały masaż, komunikacja, miła muzyka - myślę że znalazłem nowy salon masażu.",
    rating: 5,
  },
  {
    name: "Юлия Д.",
    text: "Pudełko prezentowe od przyjaciółki otworzyło przede mną wspaniałe studio i utalentowaną masażystkę Olgę. Masaż relaksacyjny całego ciała – idealny sposób na regenerację po codziennej rutynie. Gorąco polecam i na pewno wrócę! ❤️",
    rating: 5,
  },
  {
    name: "Olena P.",
    text: "Mój mąż był na masażu i wrócił zadowolony , świetnie efekty . Profesjonalnie, relaksująco i z dbałością o każdy detal, naprawdę . Polecamy z całego serca!",
    rating: 5,
  },
  { name: "Grzegorz S.", text: "Super ;-)", rating: 5 },
  {
    name: "Tomasz T.",
    text: "Super masaż! Pani Helga znalazła problematyczne miejsca i rozbiła je dokładnie. Wyszedłem jak nowonarodzony. Na 100% wrócę, a także wyślę żonę.",
    rating: 5,
  },
  {
    name: "Maja",
    text: "Czulam sie cudnie zadbana. Helga przepozytywna, atmosfera naprawde do relaksu.",
    rating: 5,
  },
  { name: "Marcin G.", text: "Rewelacja!", rating: 5 },
  {
    name: "Manlio F.",
    text: "I had a wonderful professional massage, Energetic and tailored to my needs. Helga attitude was full of care, she was checking pressure and her personality is super nice. Highly recommended!",
    rating: 5,
  },
  {
    name: "Valentyna S.",
    text: "I’m very happy and pleased to meet Olga and enjoy high quality services she provides. Very professional, personal approach and positive energy, that every time brings me back into a good mood. Highly recommend!",
    rating: 5,
  },
  {
    name: "Uladzislau K.",
    text: "Great massage, one of the best places in Warsaw, no any doubt. Olga is true professional. Recommend!",
    rating: 5,
  },
  {
    name: "Marek J.",
    text: "Przemiła pani Helga, super masaż. Czysty i przyjemny salon. Na pewno zechcę wrócić.",
    rating: 5,
  },
  {
    name: "Ira K.",
    text: "Без перебільшення, найкращий масажист у місті. Оля - професіонал своєї справи, дуже компетентна та чуйна до клієнта. Якщо вам потрібно привести до ладу своє тіло та думки, тоді вам 100% до неї 🥰 рекомендую від усього серця ❤️",
    rating: 5,
  },
  {
    name: "Dawid G.",
    text: "Indywidualne podejście i wysoka jakość:) polecam!",
    rating: 5,
  },
  {
    name: "Vladimir V.",
    text: "Jestem zachwycony autorskim masażem! Pani Olga ma po prostu złote ręce – potrafi sprawić, że człowiek zapomina o całym świecie i całkowicie się odpręża. Atmosfera w salonie jest niezwykła, pełna spokoju i harmonii, co pozwala w pełni się zrelaksować. Zdecydowanie polecam wszystkim, którzy szukają profesjonalnego i wyjątkowego masażu!🌷",
    rating: 5,
  },
  {
    name: "Kostia G.",
    text: "polecam! Wszystko na najwyższym poziomie;) Od razu czuć rękę specjalisty) Jestem Twoim stałym klientem!",
    rating: 5,
  },
  {
    name: "Anna P.",
    text: "Olha is a true professional. In her massage room you can really relax and get away from the daily grind!💆🌈🌊 🥹 Service is at the highest level, thank you 🙏 I recommend ❤️‍🔥",
    rating: 5,
  },
  {
    name: "Sara D.",
    text: "My lymphatic drainage massage was perfect, Helga was amazing, very considerate and kind, will definitely go back again :)",
    rating: 5,
  },
  {
    name: "Anna P.",
    text: "Kind personnel and very nice experience of massage!",
    rating: 5,
  },
  {
    name: "Видалений користувач",
    text: "W salonie panuje niezwykle przyjemna atmosfera, wszystko jest doskonale przemyślane, a każdy detal starannie dopracowany – na miejscu było wszystko, czego mogłam potrzebować, co sprawiało, że od razu poczułam się komfortowo. Sam masaż był absolutnie wspaniały! Czułam się całkowicie zrelaksowana, a jednocześnie pełna energii. Moje ciało od razu poczuło różnicę – zniknęły obrzęki, a mięśnie rozluźniły się i odprężyły. Gorąco polecam Olę każdemu, kto szuka profesjonalnego i pełnego troski masażu!",
    rating: 5,
  },
  {
    name: "Julia Ż.",
    text: "Bardzo profesjonalne podejście, napewno będę wracała 🫶",
    rating: 5,
  },
  {
    name: "Anna J.",
    text: "Fantastyczne miejsce. Na pierwszej wizycie profesjonalny wywiad. Pani Olga ma indywidualne podejście. Zabiegi wykonane profesjonalnie z dbałością o każdy szczegół…Serdecznie polecam. Czuć dobrą i pozytywną energię, chce się wracać ponownie i ponownie. Dziękuję Pani Olgo!",
    rating: 5,
  },
  {
    name: "Alla T.",
    text: "Супер!!! Золоті ручки Олі творять дива🥰",
    rating: 5,
  },
  { name: "Mariusz S.", text: "Masaz wykonany z najwieksza starannoscia", rating: 5 },
  {
    name: "Maja W.",
    text: "Jestem ogromną fanką talentu do masażu jaki ma Olha! Lavandi jest prowadzone przez nią w dbałości o detale, jest klimatyczne, pełne pięknych zapachów i niesamowicie dobrej energii. Czuję się otulona i zaopiekowana. Po zaledwie półtora miesiąca regularnych wizyt, efekty, jakie przyniosły mi autorskie masaże Olhi są spektakularne!!! Nigdy nie miałam takich nóg! Pomimo, że masaże antycellulitowe bywają niezbyt przyjemne, to Olha tak dba o balans, wykonując swój autorski masaż, że mam ochotę na kolejną wizytę, jak tylko kończymy masaż. Absolutnie, od serca polecam! Ja zostaje na zawsze!",
    rating: 5,
  },
  {
    name: "Olga B.",
    text: "Już nie pierwszy raz przychodzę do Olgi na masaż i jestem bardzo zadowolona. Bardzo przyjemna atmosfera, przytulny gabinet i wysoki poziom obsługi. Polecam wszystkim, którzy chcą poprawić stan skóry i poczuć przypływ energii!",
    rating: 5,
  },
  {
    name: "Arek S.",
    text: "Pierwsza wizyta u Olgi i już się uzależniłem od jej intuicyjnego dotyku. Rewelacyjny masaż autorski sprawił że pospinane ciało znów jest jak nowe Dziękuję bardzo Arek 🤗🌷",
    rating: 5,
  },
  {
    name: "Мила Ф.",
    text: "Jak zawsze, najlepszy masaż na świecie :) W trakcie jednej sesji potrafi usunąć napięcia, zlikwidować obrzęki, zrobić masaż antycellulitowy i relaksacyjny na całe ciało - tylko ona to potrafi!",
    rating: 5,
  },
  {
    name: "Adam T.",
    text: "Gorąco polecam, byłem pierwszy raz i jestem bardzo zadowolony po całej wizycie. Bardzo profesjonalne podejście",
    rating: 5,
  },
  {
    name: "Switłana C.",
    text: "Usługa doskonała, atmosfera cudowna, masażystka z ogromnym talentem i doświadczeniem! Polecam ❤️",
    rating: 5,
  },
  { name: "Pawel W.", text: "To juz kolejna moja wizyta. Naprawde warto i pozdrawiam.", rating: 5 },
  { name: "Niels F.", text: "Thank you for the wonderful massage. I will definitely come back soon 😊", rating: 5 },
  {
    name: "Ola A.",
    text: "Jestem bardzo zadowolona, Pani Olga ma super podejście do klienta, i jeszcze większy profesjonalizm w wykonywaniu masażu. Korzystałam już kilkanaście razy z masażu u niej, efekt jest bardzo dobry, Pani Olga opiekuje się klientem od wejścia do wyjścia w sposób taki, że człowiek czuje się traktowany absolutnie wyjątkowo! Polecam bardzo bardzo masaże u Pani Olgi!",
    rating: 5,
  },
  {
    name: "Pawel W.",
    text: "Jestem bardzo zadowolony z wizyty. Mało tego, jak na nowy salon nie spodziewałem się że będize aż tak profesjonalne i miłe doświadczenie. Z pewnością niedługo zawitam ponownie.",
    rating: 5,
  },
  {
    name: "Anastasiia A.",
    text: "Была сегодня у мастера Ольги на лимфодренажном массаже, осталась очень довольна. Качественно, очень приятный мастер, уютный кабинет. 100% вернусь снова 🥰",
    rating: 5,
  },
  {
    name: "Anna P.",
    text: "Pani Olha to prawdziwa profesjonalistka! Od pierwszej chwili czuć troskę i uwagę, a autorski masaż okazał się prawdziwym ratunkiem od zmęczenia i stresu. Po sesji poczułam lekkość i pełne odprężenie. Zakończenie zabiegu pyszną herbatą dodało całości przytulności i komfortu. Szczerze polecam Olgę każdemu, kto chce zafundować sobie odrobinę relaksu i profesjonalnej opieki!",
    rating: 5,
  },
];


const getInitials = (name) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

function PremiumStars({rating = 5, className = ""}) {
  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      aria-label={`Ocena ${rating} na 5`}>
      {Array.from({length: rating}).map((_, i) => (
        <AiFillStar
          key={i}
          className="w-4 h-4"
          style={{
            color: GOLD,
            filter: "drop-shadow(0 0 6px rgba(214,177,106,.25))",
          }}
        />
      ))}
    </div>
  );
}

function ReviewCard({name, text, rating}) {
  return (
    <motion.figure
      initial={{opacity: 0, y: 24}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true}}
      transition={{duration: 0.5, ease: "easeOut"}}
      className="relative w-full h-[180px] sm:h-max  rounded-2xl p-[1px] bg-gradient-to-br"
      style={{
        backgroundImage: `linear-gradient(120deg, ${GOLD}99, transparent 35%, ${GOLD}22)`,
      }}>
      <div className="relative rounded-2xl h-full bg-secondaryColor/60 backdrop-blur-lg px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_10px_30px_rgba(0,0,0,0.4)] flex flex-col">
        <div
          className="pointer-events-none absolute -top-3 left-6 text-5xl leading-none select-none"
          style={{color: `${GOLD}66`}}>
          “
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full grid place-items-center bg-white/5 text-white font-semibold">
              {getInitials(name)}
            </div>
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{boxShadow: `inset 0 0 0 1px ${GOLD}55`}}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm tracking-[0.12em] uppercase text-white font-medium">
              {name}
            </span>
            <PremiumStars rating={rating} />
          </div>
        </div>

        <blockquote
          className="text-base leading-relaxed text-white/90"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 5,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
          {text}
        </blockquote>

        <div className="mt-auto pt-3">
          <div className="h-px w-1/3" style={{backgroundColor: `${GOLD}66`}} />
        </div>
      </div>
    </motion.figure>
  );
}

export default function ReviewsSection() {
  return (
    <section
      id="opinie"
      className="relative select-none overflow-hidden"
      style={{
        backgroundColor: EGGPLANT,
        backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.8), rgba(0,0,0,0.85)), url('/reviews-img/rev.webp')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{boxShadow: "inset 0 0 200px rgba(0,0,0,0.8)"}}
      />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <ScrollAnimationWrapper>
          <SectionTitle>Opinie</SectionTitle>

          {/* БЕЙДЖ (адаптивно переносится) */}
          <div className="text-center pb-8">
            <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 py-2 rounded-full bg-white/5 text-white/90 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <PremiumStars rating={5} />
              <span className="text-sm tracking-[0.18em] uppercase">
                5.0 / 5 na Booksy
              </span>
              {/* точку скрываем только на очень узких — чтобы не повисала первой в строке */}
              <span className="text-white/60 hidden xs:inline">•</span>
              <span className="text-sm text-white/70">50+ opinii</span>
              <a
                href="https://booksy.com/pl-pl/262690_lavandi-studio-masazu_masaz_3_warszawa#ba_s=seo"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-2 underline-offset-4"
                style={{color: GOLD, textDecorationColor: `${GOLD}99`}}>
                Zobacz więcej
              </a>
            </div>
          </div>

          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{768: {slidesPerView: 2}, 1200: {slidesPerView: 3}}}
            autoplay={{delay: 7000, disableOnInteraction: false}}
            loop
            className="pb-10 [--swiper-theme-color:theme(colors.white)]">
            {reviews.map((r, i) => (
              <SwiperSlide key={i} className="h-auto will-change-transform">
                <div className="h-full">
                  <ReviewCard {...r} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
}
