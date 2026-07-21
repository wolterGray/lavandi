import HeroCarousel from "./HeroCarousel";

function Home() {
  return (
    <section id="home" className="relative z-[1] h-[92vh] min-h-[660px] max-h-[920px] w-full overflow-hidden">
      <HeroCarousel />
    </section>
  );
}

export default Home;
