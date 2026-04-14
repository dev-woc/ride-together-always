import { createUploadthing, type FileRouter } from 'uploadthing/server';

const f = createUploadthing();

export const ourFileRouter = {
  introVideo: f({ video: { maxFileSize: '32MB', maxFileCount: 1 } })
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => {
      console.log('Upload complete:', file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
