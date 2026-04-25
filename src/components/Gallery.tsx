import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Swiper from 'swiper';
import 'swiper/css';
import './Gallery.css';
import type { CommunityPhoto } from '@/types/community-photo';

const fallbackImages = Object.values(
  import.meta.glob('@/assets/gallery/*', { eager: true, query: '?url', import: 'default' })
) as string[];

export const Gallery = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const swiperContainerRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<Swiper | null>(null);
  const photosQuery = useQuery({
    queryKey: ['community-photos'],
    queryFn: async () => {
      const response = await fetch('/api/community-photos');

      if (!response.ok) {
        throw new Error('Failed to load community photos');
      }

      return response.json() as Promise<{ photos: CommunityPhoto[] }>;
    },
  });

  const images = useMemo(() => {
    if (photosQuery.data?.photos.length) {
      return photosQuery.data.photos.map((photo, index) => ({
        src: photo.image_url,
        alt: photo.alt_text.trim() || `Community photo ${index + 1}`,
      }));
    }

    return fallbackImages.map((src, index) => ({
      src,
      alt: `Community photo ${index + 1}`,
    }));
  }, [photosQuery.data?.photos]);

  useEffect(() => {
    if (!swiperContainerRef.current || images.length === 0) {
      return;
    }

    swiperRef.current?.destroy(true, true);
    swiperRef.current = new Swiper(swiperContainerRef.current, {
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
      swiperRef.current = null;
    };
  }, [images.length]);

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
          <div ref={swiperContainerRef} className="swiper-container">
            <div className="swiper-wrapper">
              {images.map((image, index) => (
                <div className="swiper-slide" key={`${image.src}-${index}`}>
                  <img src={image.src} alt={image.alt} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
