import HeroCarousel from "./HeroCarousel";

function Home() {
  return (
    <section id="home" className="relative z-[1] w-full bg-surface">
      <div className="relative h-[min(700px,calc(100svh-130px))] min-h-[540px] w-full overflow-hidden bg-surface shadow-2xl sm:min-h-[600px]">
        <HeroCarousel />
      </div>
    </section>
  );
}

export default Home;
