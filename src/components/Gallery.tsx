import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import communityCycling from '@/assets/community-cycling.jpg';
import cyclingDetail from '@/assets/cycling-detail.jpg';
import heroCycling from '@/assets/hero-cycling.jpg';
import wellnessCycling from '@/assets/wellness-cycling.jpg';

const slides = [
  { src: communityCycling, alt: 'Community cycling event' },
  { src: heroCycling, alt: 'Cyclists riding through urban streets' },
  { src: wellnessCycling, alt: 'Wellness cycling session' },
  { src: cyclingDetail, alt: 'Cycling detail shot' },
];

export const Gallery = () => {
  return (
    <section id="gallery" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Our Community</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Moments from our rides, events, and the people who make it all happen.
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl px-12">
          <Carousel opts={{ loop: true }} className="w-full">
            <CarouselContent>
              {slides.map((slide) => (
                <CarouselItem key={slide.src}>
                  <div className="overflow-hidden rounded-2xl aspect-[16/9]">
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};
