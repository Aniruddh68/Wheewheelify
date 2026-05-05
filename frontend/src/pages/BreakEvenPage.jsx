import Navbar from '@/components/Navbar';
import BreakEvenAnalysis from '@/components/features/BreakEvenAnalysis/BreakEvenAnalysis';

/**
 * BreakEvenPage
 * -------------
 * Page shell that wraps the BreakEvenAnalysis feature component
 * with the standard Wheelify Navbar.
 */
export default function BreakEvenPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BreakEvenAnalysis />
    </div>
  );
}
