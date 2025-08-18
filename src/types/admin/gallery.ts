export interface GalleryItem {
  id: string
  title: string
  description: string
  type: "image" | "video" | "youtube"
  url: string
  thumbnail: string
  categories: string[]
  featured: boolean
  videoId?: string // For YouTube videos
  order?: number // For order management
  dateAdded: string
}

export interface FormDataGallery {
  id: string
  title: string
  description: string
  type: "image" | "video" | "youtube"
  url: string
  thumbnail: string
  categories: string[]
  featured: boolean
  videoId?: string
}
