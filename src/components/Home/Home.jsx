import HeroCarousel from "./HeroCarousel";

function Home() {
  return (
    <section id="home" className="relative z-[1] h-[85vh] min-h-[580px] max-h-[820px] w-full overflow-hidden">
      <HeroCarousel />
    </section>
  );
}

export default Home;
