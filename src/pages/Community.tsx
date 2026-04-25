import { Navbar } from '@/components/Navbar';
import { Gallery } from '@/components/Gallery';
import { CommunityVideos } from '@/components/CommunityVideos';
import { Footer } from '@/components/Footer';

const Community = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24">
        <Gallery />
        <CommunityVideos />
      </div>
      <Footer />
    </div>
  );
};

export default Community;
