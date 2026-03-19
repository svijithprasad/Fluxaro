import { generateComponents } from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react/hooks";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const { UploadButton, UploadDropzone, Uploader } =
  generateComponents<OurFileRouter>();

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();

// import { OurFileRouter } from "@/app/api/uploadthing/core";
// import {
//   generateReactHelpers,
//   generateUploadButton,
//   generateUploadDropzone,
// } from "@uploadthing/react";

// export const UploadButton = generateUploadButton<OurFileRouter>();
// export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

// export const useUploadThing = generateReactHelpers<OurFileRouter>();
// export const uploadFiles = generateReactHelpers<OurFileRouter>();
