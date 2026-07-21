import HeroCarousel from "./HeroCarousel";

function Home() {
  return (
    <section id="home" className="relative z-[1] h-[88vh] min-h-[640px] max-h-[860px] w-full overflow-hidden">
      <HeroCarousel />
    </section>
  );
}

export default Home;
