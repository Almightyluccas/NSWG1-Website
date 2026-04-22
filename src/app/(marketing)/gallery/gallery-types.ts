export type MediaType = "image" | "video" | "youtube";

export interface MarketingGalleryItem {
  id: number;
  title: string;
  category: string;
  unit: string[];
  type: MediaType;
  src: string;
  thumbnail?: string;
  videoType?: "local" | "youtube";
  videoId?: string;
  description: string;
}

export interface MarketingGalleryApiResponse {
  items: MarketingGalleryItem[];
}
