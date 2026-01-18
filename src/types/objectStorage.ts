export interface GalleryItem {
  title: string;
  altText: string;
  description: string;
  category: string;
  unit: string;
  display_order?: number;
}

export interface DocumentMetaData {
  title: string;
  authorizedRoles: string[];
  description?: string;
  uploadedBy?:string;
  uploadDate?:string;
  unit:string;
  category:string;
}


export type UploadType = "profile" | "background" | "document" | "gallery"
