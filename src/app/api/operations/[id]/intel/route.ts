import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.member)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const intel = await database.get.operationIntel(id);
    return NextResponse.json(intel);
  } catch (error) {
    console.error("Error fetching operation intel:", error);
    return NextResponse.json(
      { error: "Failed to fetch intel" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const intelId = await database.post.operationIntel({
      campaignId: id,
      type: body.type,
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      minimumRole: body.minimumRole,
      createdBy: session.user.id!,
    });

    return NextResponse.json({ id: intelId, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating operation intel:", error);
    return NextResponse.json(
      { error: "Failed to create intel" },
      { status: 500 }
    );
  }
}
