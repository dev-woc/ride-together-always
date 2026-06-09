import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, CheckCircle, X, Video } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import type { CommunityVideo } from '@/types/community-video';

export const CommunityVideos = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const queryClient = useQueryClient();

  const { data, refetch } = useQuery({
    queryKey: ['community-videos'],
    queryFn: () =>
      fetch('/api/community-videos')
        .then((r) => r.json()) as Promise<{ videos: CommunityVideo[] }>,
  });

  const videos = data?.videos ?? [];

  // Upload form state
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const { startUpload, isUploading } = useUploadThing('communitySubmission', {
    onUploadProgress: (p) => setUploadProgress(p),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) { setError('Please select a video file.'); return; }
    setError('');

    try {
      const uploaded = await startUpload([videoFile]);
      const file = uploaded?.[0];
      if (!file) throw new Error('Upload failed — no file returned.');

      const url = (file as { ufsUrl?: string; url: string }).ufsUrl ?? file.url;

      const res = await fetch('/api/community-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: url, file_key: file.key, title: title.trim() }),
      });
      if (!res.ok) throw new Error('Failed to save video.');

      await queryClient.invalidateQueries({ queryKey: ['community-videos'] });
      await refetch();
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  const resetForm = () => {
    setFormOpen(false);
    setTitle('');
    setVideoFile(null);
    setUploadProgress(0);
    setSubmitted(false);
    setError('');
  };

  return (
    <section ref={ref} className="py-20 bg-card">
      <div className="container mx-auto px-4">

        {/* Section header */}
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

        {/* Video grid */}
        {videos.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
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
        )}

        {/* Share your video CTA / form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-xl mx-auto"
        >
          {!formOpen && !submitted && (
            <div className="border border-border rounded-sm p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                  <Video className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="font-display text-xl font-bold uppercase text-foreground mb-2">
                Share Your Ride
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                Got a video from a KPF event or ride? Upload it and be part of the community feed.
              </p>
              <button
                onClick={() => setFormOpen(true)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display text-sm uppercase tracking-wider px-6 py-3 hover:bg-primary/90 transition-colors rounded-sm"
              >
                <Upload className="w-4 h-4" />
                Upload a Video
              </button>
            </div>
          )}

          {formOpen && !submitted && (
            <div className="border border-border rounded-sm p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold uppercase text-foreground">Share Your Video</h3>
                <button onClick={resetForm} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block font-display text-xs uppercase tracking-wider text-foreground">
                    Video Title <span className="text-muted-foreground font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Bike N Thrive March 2026"
                    maxLength={120}
                    className="w-full bg-background border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary rounded-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-display text-xs uppercase tracking-wider text-foreground">
                    Video File <span className="text-primary">*</span>
                  </label>
                  {videoFile ? (
                    <div className="flex items-center gap-3 bg-background border border-primary/30 rounded-sm px-4 py-3">
                      <Video className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm text-foreground truncate flex-1">{videoFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setVideoFile(null)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-sm py-8 cursor-pointer hover:border-primary transition-colors group">
                      <Upload className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        Click to select a video
                      </span>
                      <span className="text-xs text-muted-foreground">MP4, MOV, WebM — max 256 MB</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => { setVideoFile(e.target.files?.[0] ?? null); setError(''); }}
                      />
                    </label>
                  )}
                </div>

                {isUploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Uploading…</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <p className="text-destructive text-xs">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isUploading || !videoFile}
                  className="w-full bg-primary text-primary-foreground font-display text-sm uppercase tracking-wider py-3 hover:bg-primary/90 transition-colors disabled:opacity-60 rounded-sm"
                >
                  {isUploading ? `Uploading… ${uploadProgress}%` : 'Submit Video'}
                </button>
              </form>
            </div>
          )}

          {submitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border border-border rounded-sm p-8 text-center"
            >
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold uppercase text-foreground mb-2">Video Submitted!</h3>
              <p className="text-muted-foreground text-sm mb-6">Your video is now live in the community feed. Thanks for sharing!</p>
              <button
                onClick={resetForm}
                className="font-display text-xs uppercase tracking-wider text-primary hover:underline"
              >
                Upload another
              </button>
            </motion.div>
          )}
        </motion.div>

      </div>
    </section>
  );
};
