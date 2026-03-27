import { Navbar } from '@/components/Navbar';
import { Resources } from '@/components/Resources';
import { Footer } from '@/components/Footer';

const MentalHealthResources = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24">
        <Resources />
      </div>
      <Footer />
    </div>
  );
};

export default MentalHealthResources;
