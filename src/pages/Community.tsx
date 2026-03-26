import { Navbar } from '@/components/Navbar';
import { Gallery } from '@/components/Gallery';
import { Footer } from '@/components/Footer';

const Community = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24">
        <Gallery />
      </div>
      <Footer />
    </div>
  );
};

export default Community;
