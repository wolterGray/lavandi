import HeroCarousel from "./HeroCarousel";

function Home() {
  return (
    <section id="home" className="relative z-[1] h-[112vh] min-h-[920px] max-h-[1180px] w-full overflow-hidden">
      <HeroCarousel />
    </section>
  );
}

export default Home;
