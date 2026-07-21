import HeroCarousel from "./HeroCarousel";

function Home() {
  return (
    <section id="home" className="relative z-[1] h-[98vh] min-h-[740px] max-h-[1000px] w-full overflow-hidden">
      <HeroCarousel />
    </section>
  );
}

export default Home;
