// Lavandi Landing Page - React + Tailwind
// Requirements: React 18+, Tailwind CSS, react-scroll
// 1. Create a Vite React project:  npm create vite@latest lavandi --template react
// 2. Install deps:  cd lavandi && npm install && npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p && npm install react-scroll
// 3. In src/index.css put:
//    @tailwind base;@tailwind components;@tailwind utilities;
// 4. Replace images in /public or import your own assets.
// 5. Place this file as src/App.jsx and run: npm run dev

import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import MassageServices from "./components/MassageServices/MassageServices";
import PriceSection from "./components/PriceSection/PriceSection";
import AboutSection from "./components/AboutSection/AboutSection";
import TeamSections from "./components/TeamSections/TeamSections";
import BookingSection from "./components/BookingSection/BookingSection";
import Footer from "./components/Footer/Footer";
import HelmetSEO from "./components/HelmetSEO";

export default function App() {
  const services = [
    {
      title: "Masaż klasyczny",
      time: [30, 60, 90, 120],
      price: [170, 225, 245, 330, 420],
      desc: "Klasyczny masaż dla odprężenia i poprawy krążenia.",
      img: "/services-img/1.webp",
    },
    {
      title: "Masaż sportowy",
      time: [30, 60, 75, 90, 120],
      price: [170, 225, 245, 330, 420],
      desc: "Intensywny sportowy masaż dla osób aktywnych fizycznie.",
      img: "/services-img/2.webp",
    },
    {
      title: "Masaż relaksacyjny",
      time: [30, 60, 75, 90, 120],
      price: [170, 225, 245, 330, 420],
      desc: "Relakscyjny masaż dla redukcji stresu i napięcia.",
      img: "/services-img/3.webp",
    },
    {
      title: "Masaż limfatyczny",
      time: [30, 60, 75, 90, 120],
      price: [170, 225, 245, 330, 420],
      desc: "Masaż wspomagający układ limfatyczny i detoks organizmu.",
      img: "/services-img/4.webp",
    },
    {
      title: "Masaż antycellulitowy",
      time: [30, 60, 75, 90, 120],
      price: [170, 225, 245, 330, 420],
      desc: "Specjalistyczny masaż antycellulitowy, poprawiający wygląd skóry i redukujący cellulit.",
      img: "/services-img/5.webp",
    },
    {
      title: "Masaż twarzy i glowy",
      time: [30, 60],
      price: [149, 220],
      desc: "Delikatny masaż poprawiający krążenie i napięcie skóry twarzy.",
      img: "/services-img/6.webp",
    },
    {
      title: "Masaż autorski",
      time: [60, 75, 90, 120],
      price: [200, 260, 310],
      desc: "Indywidualnie autorski dopasowany masaż łączący różne techniki.",
      img: "/services-img/7.webp",
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
      <div className="font-comforta  container mx-auto px-4">
        {/* Services */}
        <MassageServices services={services} />

        {/* Prices */}
        <PriceSection services={services} />

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
