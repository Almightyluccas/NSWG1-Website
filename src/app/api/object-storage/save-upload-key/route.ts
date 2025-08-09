import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { database } from "@/database";
import {authOptions} from "@/lib/authOptions";
import ImageStorage from "@/lib/Object-Storage/ImageStorage";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key, uploadType } = await request.json();

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: "A valid 'key' is required." }, { status: 400 });
    }
    if (!uploadType || !['profile', 'background'].includes(uploadType)) {
      return NextResponse.json({ error: "Invalid 'uploadType' specified." }, { status: 400 });
    }

    const userId = session.user.id;

    if (uploadType === 'profile') {
      await database.put.userProfilePicture(key, userId);
    } else if (uploadType === 'background') {
      await database.put.userCustomHeroImage(key, userId)
    }

    return NextResponse.json({ success: true, message: "Database updated." });

  } catch (error) {
    console.error("Error in save-upload-key API route:", error);
    await ImageStorage.deleteObject((await request.json()).key);
    return NextResponse.json({ error: "Failed to update database." }, { status: 500 });
  }
}
