import { useEffect, useRef } from 'react';
import Swiper from 'swiper';
import 'swiper/css';
import './Gallery.css';

const images = Object.values(
  import.meta.glob('@/assets/gallery/*', { eager: true, query: '?url', import: 'default' })
) as string[];

export const Gallery = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<Swiper | null>(null);

  useEffect(() => {
    swiperRef.current = new Swiper('.gallery-swiper .swiper-container', {
      loop: true,
      centeredSlides: true,
      slidesPerView: 'auto',
      spaceBetween: 16,
    });

    // Trigger load animation
    requestAnimationFrame(() => {
      sectionRef.current?.classList.add('loaded');
    });

    return () => {
      swiperRef.current?.destroy(true, true);
    };
  }, []);

  return (
    <section id="gallery" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Our Community</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Moments from our rides, events, and the people who make it all happen.
          </p>
        </div>

        <div ref={sectionRef} className="gallery-swiper">
          <div className="swiper-container">
            <div className="swiper-wrapper">
              {images.map((src, i) => (
                <div className="swiper-slide" key={src}>
                  <img src={src} alt={`Community photo ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
