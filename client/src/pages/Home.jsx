import GlowBackground from "../components/GlowBackground";
import HeroSection from "../components/HeroSection";
import FormShell from "../components/FormShell";

function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070b14]">
      <GlowBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <HeroSection />

        <div className="mx-auto mt-12 max-w-3xl">
          <FormShell />
        </div>
      </div>
    </div>
  );
}

export default Home;