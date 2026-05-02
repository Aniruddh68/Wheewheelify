import Navbar from '@/components/Navbar';
import FuelCalculator from '@/components/features/FuelCalculator/FuelCalculator';

/**
 * FuelCalculatorPage
 * ------------------
 * Page shell that wraps the FuelCalculator feature component
 * with the standard Wheelify Navbar.
 */
export default function FuelCalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FuelCalculator />
    </div>
  );
}
