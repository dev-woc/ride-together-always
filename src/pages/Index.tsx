import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Gallery } from '@/components/Gallery';
import { Programs } from '@/components/Programs';
import { Events } from '@/components/Events';
import { Resources } from '@/components/Resources';
import { Donate } from '@/components/Donate';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <About />
      <Gallery />
      <Programs />
      <Events />
      <Resources />
      <Donate />
      <Footer />
    </div>
  );
};

export default Index;
