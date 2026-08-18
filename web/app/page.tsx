import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import RepoTicker from "@/components/sections/RepoTicker";
import Why from "@/components/sections/Why";
import Tools from "@/components/sections/Tools";
import Install from "@/components/sections/Install";
import Catalog from "@/components/sections/Catalog";
import CTABand from "@/components/sections/CTABand";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <RepoTicker />
        <Why />
        <Tools />
        <Install />
        <Catalog />
        <CTABand />
      </main>
      <Footer />
    </>
  );
}
