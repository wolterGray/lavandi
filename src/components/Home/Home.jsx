import HeroCarousel from "./HeroCarousel";

function Home() {
  return (
    <section id="home" className="relative z-[1] w-full bg-cream px-2 pt-2 pb-4 sm:px-3 sm:pt-3 lg:px-4">
      <div className="relative mx-auto max-w-[2400px] h-[95vh] min-h-[720px] max-h-[1100px] w-full overflow-hidden rounded-[28px] sm:rounded-[40px] border border-border/40 shadow-2xl bg-cream">
        <HeroCarousel />
      </div>
    </section>
  );
}

export default Home;
