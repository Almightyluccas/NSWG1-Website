import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import imageCompression from "browser-image-compression";
import { Session } from "next-auth";
import { GalleryItem, UploadType, DocumentMetaData } from "@/types/objectStorage";

const ImageOptions = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp',
  initialQuality: 1,
};

interface presignedUrlResponse {
  url: string;
  key: string;
}

interface UploadParams {
  formData: FormData;
  uploadType: UploadType;
  router: AppRouterInstance;
  updateSession?: (data: { image: string }) => Promise<Session | null>;
}

const getPresignedUrl = async (uploadType: UploadType, contentType: string): Promise<presignedUrlResponse> => {
  const presignedUrlResponse = await fetch('/api/object-storage/generate-upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uploadType: uploadType,
      contentType: contentType,
    }),
  });

  if (!presignedUrlResponse.ok) {
    const errorData = await presignedUrlResponse.json().catch(() => null);
    const errorMessage = errorData?.error || 'Failed to get a secure upload URL.';

    throw new Error(errorMessage);
  }


  const { url, key } = await presignedUrlResponse.json();
  return { url, key };
}

const uploadFileToStorage = async (url: string, file: File) => {
  const directUploadResponse = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  if (!directUploadResponse.ok) throw new Error('File upload to storage failed.');
}

const saveUploadDetails = async (key: string, uploadType: UploadType, metadata?: GalleryItem | DocumentMetaData) => {
  const saveKeyResponse = await fetch('/api/object-storage/save-upload-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, uploadType, metadata }),
  });

  if (!saveKeyResponse.ok) throw new Error('Failed to save upload details to database.');
}

export const fileUpload = async ({ formData, uploadType, router, updateSession }: UploadParams) => {
  const file = formData.get('file') as File;

  if (!file) throw new Error("No file provided.");

  try {
    const fileToUpload = file.type.startsWith('image/')
      ? await imageCompression(file, ImageOptions)
      : file;

    const { url, key } = await getPresignedUrl(uploadType, fileToUpload.type);

    await uploadFileToStorage(url, fileToUpload);

    switch (uploadType) {
      case 'gallery':
        const galleryItem: GalleryItem = {
          title: formData.get('title') as string,
          altText: formData.get('altText') as string,
          description: formData.get('description') as string,
          category: formData.get('category') as string,
          unit: formData.get('unit') as string,
        };
        await saveUploadDetails(key, uploadType, galleryItem);
        break;

      case 'document':
        const documentMetadata: DocumentMetaData = {
          title: formData.get('title') as string,
          roles: JSON.parse(formData.get('roles') as string) as string[],
        };
        await saveUploadDetails(key, uploadType, documentMetadata);
        break;

      case 'profile':
        if (updateSession) await updateSession({ image: key });
        await saveUploadDetails(key, uploadType);
        break;

      default:
        await saveUploadDetails(key, uploadType);
        break;
    }

    router.refresh();
  } catch (error) {
    console.error("Image upload failed:", error);
    throw new Error(`Failed to upload image: ${error}`);
  }
};
