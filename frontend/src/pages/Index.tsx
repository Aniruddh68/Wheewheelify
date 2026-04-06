import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import CarInterstitial from "@/components/CarInterstitial";
import WhyWheelify from "@/components/WhyWheelify";
import BuiltWithPurpose from "@/components/BuiltWithPurpose";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="grain-overlay" />
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <CarInterstitial />
        <WhyWheelify />
        <BuiltWithPurpose />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

