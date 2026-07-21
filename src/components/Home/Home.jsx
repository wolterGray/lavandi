import HeroCarousel from "./HeroCarousel";

function Home() {
  return (
    <section id="home" className="relative z-[1] w-full px-3 pt-3 pb-6 sm:px-6 sm:pt-4 md:px-8 lg:px-10">
      <div className="relative mx-auto max-w-[1440px] h-[65vh] min-h-[480px] max-h-[640px] w-full overflow-hidden rounded-[20px] sm:rounded-[28px] md:rounded-[36px] border border-border/40 shadow-2xl">
        <HeroCarousel />
      </div>
    </section>
  );
}

export default Home;
