import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VehicleBrowser from "@/components/VehicleBrowser";

const BrowseVehicles = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="grain-overlay" />
      <Navbar />
      <main className="pt-20"> {/* Add padding for fixed navbar */}
        <VehicleBrowser />
      </main>
      <Footer />
    </div>
  );
};

export default BrowseVehicles;
