import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import MassageServices from "./components/MassageServices/MassageServices";
import PriceSection from "./components/PriceSection/PriceSection";
import AboutSection from "./components/AboutSection/AboutSection";
import TeamSections from "./components/TeamSections/TeamSections";
import BookingSection from "./components/BookingSection/BookingSection";
import Footer from "./components/Footer/Footer";
import HelmetSEO from "./components/HelmetSEO";
import ReviewsSection from "./components/ReviewsSection/ReviewsSection";

import React from "react";
import CallWidget from "./ui/CallWidget";
import ConsentBanner from "./ui/ConsentBanner";

export default function App() {
  const reviews = [
    {name: "Mateusz K.", text: "Polecam:)", rating: 5},
    {name: "Marcin R.", text: "polecam :)", rating: 5},
    {
      name: "Konstantin L.",
      text: "Авторский массаж супер! Очень чуткий и качественный массаж, как и люблю был пожёстче. Рекомендую!",
      rating: 5,
    },
    {name: "Valentyn T.", text: "Amazing!", rating: 5},
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
    {name: "Wiktor H.", text: "Jak zwykle super", rating: 5},
    {name: "Małgorzata W.", text: "Polecam!", rating: 5},
    {name: "Mateusz K.", text: "Udana wizyta, polecam :)", rating: 5},
    {
      name: "Ксения Б.",
      text: "Лучшее место в Варшаве . Оля просто богиня ♥️ рекомендую",
      rating: 5,
    },
    {name: "Mateusz Ł.", text: "Udana wizyta", rating: 5},
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
    {name: "Kuba B.", text: "Wspaniały masaż!", rating: 5},
    {
      name: "Pawel C.",
      text: "Doskonały masaż, komunikacja, miła muzyka - myślę że znalazłem новый salon masażu.",
      rating: 5,
    },
    {
      name: "Юлия Д.",
      text: "Pudełko prezentowe od przyjaciółki otworzyło przede mną wspaniałe studio i utalentowaną masażystkę Olgę. Masaż relaksacyjny całego ciała – idealny sposób na regenerację po codziennej rutynie. Gorąco polecam i на pewno wrócę! ❤️",
      rating: 5,
    },
    {
      name: "Olena P.",
      text: "Mój mąż był na masażu i wrócił zadowolony , świetnie efekty . Profesjonalnie, relaksująco i z dbałością o każdy detal, naprawdę . Polecamy z całego serca!",
      rating: 5,
    },
    {name: "Grzegorz S.", text: "Super ;-)", rating: 5},
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
    {name: "Marcin G.", text: "Rewelacja!", rating: 5},
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
    {
      name: "Mariusz S.",
      text: "Masaz wykonany z najwieksza starannoscia",
      rating: 5,
    },
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
      text: "Jak zawsze, najlepszy masaż na świecie :) W trakcie jednej sesji potrafi usunąć napięcia, zlikwidować obrzęki, zrobić masaż antycellulitowy i relaksacyjny na całe ciało - tylko она to potrafi!",
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
    {
      name: "Pawel W.",
      text: "To juz kolejna moja wizyta. Naprawde warto i pozdrawiam.",
      rating: 5,
    },
    {
      name: "Niels F.",
      text: "Thank you for the wonderful massage. I will definitely come back soon 😊",
      rating: 5,
    },
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
  const services = [
    {
      title: "Masaż klasyczny",
      time: [30, 60, 75, 90, 120],
      price: [170, 255, 310, 360, 450],
      desc: "Masaż klasyczny to sprawdzona metoda relaksu i regeneracji. Łagodzi napięcia, poprawia krążenie i rozluźnia mięśnie, dopasowując się do Twoich potrzeb.",
      img: "/services-img/1.webp",
      discount: 18
    },
    {
      title: "Masaż sportowy",
      time: [30, 60, 75, 90, 120],
      price: [170, 255, 310, 360, 450],
      desc: "Intensywny masaż wspierający regenerację po wysiłku. Zmniejsza napięcia mięśni, poprawia elastyczność i pomaga zapobiegać kontuzjom.",
      img: "/services-img/2.webp",
      discount: 18
    },
    {
      title: "Masaż relaksacyjny",
      time: [30, 60, 75, 90, 120],
      price: [170, 255, 310, 360, 450],
      desc: "Delikatny masaż, który redukuje stres i napięcie. Płynne, rytmiczne ruchy wprowadzają ciało i umysł w stan głębokiego odprężenia.",
      img: "/services-img/3.webp",
      discount: 18
    },
    {
      title: "Masaż limfatyczny",
      time: [30, 60, 75, 90, 120],
      price: [170, 255, 310, 360, 450],
      desc: "Terapia wspierająca układ limfatyczny. Pomaga redukować obrzęki, poprawia przepływ limfy i wspomaga proces detoksykacji organizmu.",
      img: "/services-img/4.webp",
      discount: 18
    },
    {
      title: "Masaż antycellulitowy",
      time: [30, 60, 75, 90, 120],
      price: [170, 255, 310, 360, 450],
      desc: "Zabieg ujędrniający skórę i poprawiający krążenie. Skutecznie wspiera walkę z cellulitem i przywraca skórze gładkość i elastyczność.",
      img: "/services-img/5.webp",
      discount: 18
    },
    {
      title: "Masaż twarzy i głowy",
      time: [30, 60],
      price: [149, 220],
      desc: "Relaksujący masaż łagodzący napięcia w okolicy głowy i twarzy. Poprawia krążenie, zmniejsza stres i wspiera ogólne samopoczucie.",
      img: "/services-img/6.webp",
      discount: 18
    },
    {
      title: "Masaż autorski",
      time: [90, 120],
      price: [490, 590],
      desc: "Indywidualnie dopasowany masaż, łączący techniki klasyczne, relaksacyjne i sportowe. Idealny dla głębokiego relaksu i regeneracji.",
      img: "/services-img/7.webp",
      discount: 18
    },
    {
      title: "Masaż dla dzieci",
      time: [30, 60, 75, 90, 120],
      price: [170, 250, 310, 360, 450],
      desc: "Delikatny masaż wspierający regenerację i redukcję stresu, szczególnie u aktywnych dzieci i młodzieży. Bezpieczny i korzystny dla zdrowia. Dla dzieci od 5 do 18 lat.",
      img: "/services-img/9.webp",
      discount: 18
    },
  ];

  const navItems = [
    {label: "Strona główna", path: "home"},
    {label: "Usługi", path: "services"},
    {label: "O nas", path: "about"},
    {label: "Cennik", path: "prices"},
    {label: "Zespól", path: "team"},
  ];
  const homeBanner = [
      { img: "/massage/1.png", title: "Atmosfera NUAR", news: "Spokój. Cisza. Regeneracja." },
      { img: "/massage/2.png", title: "Droga do relaksu", news: "Tu zaczyna się Twoja regeneracja" },
      { img: "/massage/3.png", title: "Wiosna w NUAR", news: "Do -20% na wybrane masaże" },
    ];
  return (
    <div className="antialiased  text-mainColor scroll-smooth">
      <HelmetSEO />
      {/* Navbar */}
      <div className="w-[90vw] relative mx-auto">
        <Header navItems={navItems} />
       
      </div>
       {/* Hero */}
        <Home homeBanner={homeBanner} />
      <CallWidget />
      <div className=" w-[90vw] relative mx-auto">
        {/* Services */}
        <MassageServices services={services} />

        {/* Prices */}
        <PriceSection services={services} />

        {/* Reviews */}
        <ReviewsSection reviews={reviews} />

        {/* About */}
        <AboutSection />

        <ConsentBanner />
        {/* Team */}
        <TeamSections />
      </div>

      {/* Book */}
      <BookingSection />

      {/* Footer */}
      <Footer navItems={navItems} />
    </div>
  );
}
