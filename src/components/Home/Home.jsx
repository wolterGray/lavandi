import HeroCarousel from "./HeroCarousel";

function Home() {
  return (
    <section id="home" className="relative z-[1] h-[90vh] min-h-[620px] max-h-[900px] w-full overflow-hidden">
      <HeroCarousel />
    </section>
  );
}

export default Home;
