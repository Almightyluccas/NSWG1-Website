export interface GalleryItem {
  title: string;
  altText: string;
  description: string;
  category: string;
  unit: string;
  display_order?: number;
}
export type UploadType = "profile" | "background" | "document" | "gallery"
