import { UploadThingError, createUploadthing, type FileRouter } from 'uploadthing/server';
import { isAdminAuthenticated } from '../../api/_lib/auth';

const f = createUploadthing();

export const ourFileRouter = {
  introVideo: f({ video: { maxFileSize: '32MB', maxFileCount: 1 } })
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => {
      console.log('Upload complete:', file.url);
    }),
  driverLicense: f({ image: { maxFileSize: '10MB', maxFileCount: 1 }, pdf: { maxFileSize: '10MB', maxFileCount: 1 } })
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => {
      console.log('License upload complete:', file.url);
    }),
  communityPhoto: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      if (!(await isAdminAuthenticated(req))) {
        throw new UploadThingError("Unauthorized");
      }

      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log('Community photo upload complete:', file.url);
    }),
  communityVideo: f({ video: { maxFileSize: '256MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      if (!(await isAdminAuthenticated(req))) {
        throw new UploadThingError("Unauthorized");
      }

      return {};
    })
    .onUploadComplete(async ({ file }) => {
      console.log('Community video upload complete:', file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
