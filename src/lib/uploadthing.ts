import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from './uploadthing-router';

export { ourFileRouter } from './uploadthing-router';
export type { OurFileRouter } from './uploadthing-router';

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>({
  url: '/api/uploadthing',
});
