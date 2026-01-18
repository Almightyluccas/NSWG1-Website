import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) return new NextResponse("Missing URL", { status: 400 });

  try {
    const response = await fetch(imageUrl);
    console.log(response)
    if (!response.ok) throw new Error("Failed to fetch");

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/png",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}
