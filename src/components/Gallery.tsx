import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const images = Object.values(
  import.meta.glob('@/assets/gallery/*', { eager: true, query: '?url', import: 'default' })
) as string[];

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
              {images.map((src, i) => (
                <CarouselItem key={src}>
                  <div className="overflow-hidden rounded-2xl aspect-[16/9]">
                    <img
                      src={src}
                      alt={`Community photo ${i + 1}`}
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
