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

export default function App() {
  const services = [
    {
      title: "Masaż klasyczny",
      time: [30, 60, 75, 90, 120],
      price: [170, 225, 245, 330, 420],
      desc: "Masaż klasyczny to sprawdzona metoda relaksu i regeneracji. Łagodzi napięcia, poprawia krążenie i rozluźnia mięśnie, dopasowując się do Twoich potrzeb.",
      img: "/services-img/1.webp",
    },
    {
      title: "Masaż sportowy",
      time: [30, 60, 75, 90, 120],
      price: [170, 225, 245, 330, 420],
      desc: "Intensywny masaż wspierający regenerację po wysiłku. Zmniejsza napięcia mięśni, poprawia elastyczność i pomaga zapobiegać kontuzjom.",
      img: "/services-img/2.webp",
    },
    {
      title: "Masaż relaksacyjny",
      time: [30, 60, 75, 90, 120],
      price: [170, 225, 245, 330, 420],
      desc: "Delikatny masaż, który redukuje stres i napięcie. Płynne, rytmiczne ruchy wprowadzają ciało i umysł w stan głębokiego odprężenia.",
      img: "/services-img/3.webp",
    },
    {
      title: "Masaż limfatyczny",
      time: [30, 60, 75, 90, 120],
      price: [170, 225, 245, 330, 420],
      desc: "Terapia wspierająca układ limfatyczny. Pomaga redukować obrzęki, poprawia przepływ limfy i wspomaga proces detoksykacji organizmu.",
      img: "/services-img/4.webp",
    },
    {
      title: "Masaż antycellulitowy",
      time: [30, 60, 75, 90, 120],
      price: [170, 225, 245, 330, 420],
      desc: "Zabieg ujędrniający skórę i poprawiający krążenie. Skutecznie wspiera walkę z cellulitem i przywraca skórze gładkość i elastyczność.",
      img: "/services-img/5.webp",
    },
    {
      title: "Masaż twarzy i głowy",
      time: [30, 60],
      price: [149, 220],
      desc: "Relaksujący masaż łagodzący napięcia w okolicy głowy i twarzy. Poprawia krążenie, zmniejsza stres i wspiera ogólne samopoczucie.",
      img: "/services-img/6.webp",
    },
    {
      title: "Masaż autorski",
      time: [60, 75, 90, 120],
      price: [200, 260, 310, 400],
      desc: "Indywidualnie dopasowany masaż, łączący techniki klasyczne, relaksacyjne i sportowe. Idealny dla głębokiego relaksu i regeneracji.",
      img: "/services-img/7.webp",
    },
    {
      title: "Masaż dla dzieci",
      time: [30, 60, 75, 90, 120],
      price: [120, 199, 230, 280, 399],
      desc: "Delikatny masaż wspierający regenerację i redukcję stresu, szczególnie u aktywnych dzieci i młodzieży. Bezpieczny i korzystny dla zdrowia. Dla dzieci od 5 do 18 lat.",
      img: "/services-img/9.webp",
    },
  ];

  const navItems = [
    {label: "Strona główna", path: "home"},
    {label: "Usługi", path: "services"},
    {label: "O nas", path: "about"},
    {label: "Cennik", path: "prices"},
    {label: "Zespól", path: "team"},
  ];
  return (
    <div className="antialiased  text-mainColor scroll-smooth">
      <HelmetSEO />
      {/* Navbar */}
      <div className="w-[94vw] relative mx-auto">
        <Header navItems={navItems} />
        {/* Hero */}
        <Home />
      </div>
      <div className=" ">
        {/* Services */}
        <MassageServices services={services} />

        {/* Prices */}
        <PriceSection services={services} />

        {/* Reviews */}
        <ReviewsSection />

        {/* About */}
        <AboutSection />

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
