import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";
import imageCompression from "browser-image-compression";
import {Session} from "next-auth";
import {GalleryItem, UploadType} from "@/types/objectStorage";

const ImageOptions = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp',
  initialQuality: 1,
};

interface UploadParams {
  formData: FormData;
  uploadType: UploadType;
  router: AppRouterInstance;
  updateSession?: (data: { image: string }) => Promise<Session | null>;
}


export const imageUpload = async ({ formData, uploadType, router, updateSession }: UploadParams) => {
  const file = formData.get('file') as File;

  if (!file) {
    throw new Error("No file provided.");
  }

  try {
    const optimizedFile = await imageCompression(file, ImageOptions);

    const presignedUrlResponse = await fetch('/api/object-storage/generate-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uploadType: uploadType,
        contentType: optimizedFile.type,
      }),
    });

    if (!presignedUrlResponse.ok) throw new Error('Failed to get a secure upload URL.');

    const { url, key } = await presignedUrlResponse.json();

    const directUploadResponse = await fetch(url, {
      method: 'PUT',
      body: optimizedFile,
      headers: { 'Content-Type': optimizedFile.type },
    });

    if (!directUploadResponse.ok) throw new Error('File upload to storage failed.');

    let galleryItem: GalleryItem | null = null;
    if (uploadType === "gallery") {
      galleryItem = {
        title: formData.get('title') as string,
        altText: formData.get('altText') as string,
        description: formData.get('description') as string,
        category: formData.get('category') as string,
        unit: formData.get('unit') as string,
      };
    }

    const saveKeyResponse = await fetch('/api/object-storage/save-upload-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, uploadType, galleryItem }),
    });

    if (!saveKeyResponse.ok) throw new Error('Failed to save upload details to database.');

    if (uploadType === "profile" && updateSession) {
      await updateSession({ image: key });
    }

    router.refresh();
  } catch (error) {
    console.error("Image upload failed:", error);
    throw new Error(`Failed to upload image: ${error}`);
  }
};