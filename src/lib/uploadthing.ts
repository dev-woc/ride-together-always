import { createUploadthing, type FileRouter } from 'uploadthing/server';
import { generateReactHelpers } from '@uploadthing/react';

const f = createUploadthing();

export const ourFileRouter = {
  introVideo: f({ video: { maxFileSize: '32MB', maxFileCount: 1 } })
    .middleware(async () => {
      // Auth is validated client-side; no server session available in this setup
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log('Upload complete:', file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>({
  url: '/api/uploadthing',
});
