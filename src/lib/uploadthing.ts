import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '../../api/_lib/uploadthing-router';

export type { OurFileRouter } from '../../api/_lib/uploadthing-router';

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>({
  url: '/api/uploadthing',
});
