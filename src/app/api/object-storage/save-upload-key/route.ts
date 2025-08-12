import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { database } from "@/database";
import {authOptions} from "@/lib/authOptions";
import ImageStorage from "@/lib/Object-Storage/ImageStorage";
import {GalleryItem, UploadType} from "@/types/objectStorage";


interface RequestBody {
  key: string;
  uploadType: UploadType;
  galleryItem: GalleryItem | null ;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { key, uploadType, galleryItem } : RequestBody = await request.json();

  try {

    if (!key || key.trim() === "") {
      return NextResponse.json({ error: "A valid 'key' is required." }, { status: 400 });
    }
    if (!uploadType) {
      return NextResponse.json({ error: "Invalid 'uploadType' specified." }, { status: 400 });
    }

    const userId = session.user.id;

    switch (uploadType) {
      case 'profile':
        await database.put.userProfilePicture(key, userId);
        break;
      case 'background':
        await database.post.userCustomHeroImage(key, userId);
        break;
      case 'gallery':
        await database.post.galleryImage(key, userId, galleryItem!);
        break;
    }

    return NextResponse.json({ success: true, message: "Database updated." });

  } catch (error) {
    console.error("Error in save-upload-key API route:", error);
    await ImageStorage.deleteObject((key));
    return NextResponse.json({ error: `Failed to update database: ${error}` }, { status: 500 });
  }
}
