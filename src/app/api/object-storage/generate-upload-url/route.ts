
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import imageStorageService from "@/lib/Object-Storage/ImageStorage";
import {authOptions} from "@/lib/authOptions";
import {UploadType} from "@/types/objectStorage";

interface RequestBody {
  uploadType: UploadType;
  contentType: string;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    console.log("session is null")
    return NextResponse.json({ error: "Unauthorized: You must be logged in to upload files." }, { status: 401 });
  }

  try {
    const { uploadType, contentType }: RequestBody = await request.json();

    if (!uploadType) {
      console.log("uploadType is null")
      return NextResponse.json({ error: "Invalid 'uploadType' specified." }, { status: 400 });
    }

    if (!contentType) {console.log("contentType is null")
      return NextResponse.json({ error: "'contentType' is required." }, { status: 400 });
    }

    const { url, key } = await imageStorageService.createPresignedUploadUrl(uploadType, contentType);

    return NextResponse.json({ url, key });

  } catch (error) {
    console.error("Error in generate-upload-url API route:", error);
    return NextResponse.json({ error: `Failed to generate upload URL: ${error}` }, { status: 500 });
  }
}
