import Navbar from '@/components/Navbar';
import AIRecommender from '@/components/features/AIRecommender/AIRecommender';

/**
 * AIRecommenderPage
 * -----------------
 * Page shell that wraps the Smart AI Vehicle Recommender feature
 * with the standard Wheelify Navbar.
 */
export default function AIRecommenderPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AIRecommender />
    </div>
  );
}
