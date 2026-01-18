import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import objectStorageService from "@/lib/Object-Storage/ObjectStorage";
import { authOptions } from "@/lib/authOptions";
import { UploadType } from "@/types/objectStorage";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

interface RequestBody {
  uploadType: UploadType;
  contentType: string;
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized: You must be logged in to upload files." },
      { status: 401 }
    );
  }

  const { success } = await ratelimit.limit(session.user.id!);

  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { uploadType, contentType }: RequestBody = await request.json();

    if (!uploadType) {
      return NextResponse.json(
        { error: "Invalid 'uploadType' specified." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: `Unsupported 'contentType': ${contentType}` },
        { status: 400 }
      );
    }

    const { url, key } = await objectStorageService.createPresignedUploadUrl(
      uploadType,
      contentType
    );

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("Error in generate-upload-url API route:", error);
    return NextResponse.json(
      { error: `Failed to generate upload URL: ${error}` },
      { status: 500 }
    );
  }
}
