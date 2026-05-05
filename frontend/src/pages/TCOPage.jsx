import React from 'react';
import Navbar from '../components/Navbar';
import TotalCostOfOwnership from '../components/features/TotalCostOfOwnership/TotalCostOfOwnership';
import Footer from '../components/Footer';

const TCOPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <TotalCostOfOwnership />
      </main>
      <Footer />
    </div>
  );
};

export default TCOPage;
