import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import type { CommunityVideo } from '@/types/community-video';

export const CommunityVideos = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const { data } = useQuery({
    queryKey: ['community-videos'],
    queryFn: () =>
      fetch('/api/community-videos')
        .then((r) => r.json()) as Promise<{ videos: CommunityVideo[] }>,
  });

  const videos = data?.videos ?? [];

  if (videos.length === 0) return null;

  return (
    <section ref={ref} className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="font-display text-sm uppercase tracking-[0.3em] text-primary mb-4 block">
            Our Community
          </span>
          <h2 className="section-title text-foreground">
            COMMUNITY <span className="text-outline">VIDEOS</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="flex flex-col"
            >
              <div className="relative overflow-hidden rounded-sm bg-muted">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full aspect-video object-contain"
                >
                  <source src={video.video_url} type="video/mp4" />
                  <p className="text-muted-foreground p-4">
                    Your browser doesn't support video playback.
                  </p>
                </video>
              </div>
              {video.title && (
                <p className="mt-3 font-display font-bold uppercase tracking-wider text-foreground">
                  {video.title}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
