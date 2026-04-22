import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";
import { postAdminAlert } from "@/lib/dashboard/postAdminAlert";

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
    const item = await database.get.sseItemById(parseInt(id));

    if (!item) {
      return NextResponse.json(
        { error: "SSE item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching SSE item:", error);
    return NextResponse.json(
      { error: "Failed to fetch SSE item" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const elevated: string[] = [
      UserRole.admin,
      UserRole.superAdmin,
      UserRole.developer,
      UserRole.intelligence,
    ];
    if (!session?.user?.roles?.some((r: string) => elevated.includes(r))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const sseId = parseInt(id, 10);
    const existing = await database.get.sseItemById(sseId);
    if (!existing) {
      return NextResponse.json({ error: "SSE item not found" }, { status: 404 });
    }

    await database.put.sseItem(sseId, {
      status: body.status !== undefined ? String(body.status) : undefined,
      name: body.name !== undefined ? String(body.name) : body.title !== undefined ? String(body.title) : undefined,
      description: body.description !== undefined ? String(body.description) : undefined,
      type: body.type !== undefined ? String(body.type) : undefined,
      classification:
        body.classification !== undefined ? (body.classification ? String(body.classification) : null) : undefined,
      collectedDate:
        body.collectedDate !== undefined
          ? body.collectedDate
            ? String(body.collectedDate).slice(0, 10)
            : null
          : undefined,
    });
    await postAdminAlert({
      label: "SSE EDITED",
      message: `SSE item ${existing.name} was updated.`,
      createdBy: session.user.id!,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating SSE item:", error);
    return NextResponse.json(
      { error: "Failed to update SSE item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const sseId = parseInt(id, 10);
    const existing = await database.get.sseItemById(sseId);
    if (!existing) {
      return NextResponse.json({ error: "SSE item not found" }, { status: 404 });
    }
    await database.delete.sseItem(sseId);
    await postAdminAlert({
      label: "SSE DELETED",
      message: `SSE item ${existing.name} was deleted.`,
      type: "warning",
      createdBy: session.user.id!,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting SSE item:", error);
    return NextResponse.json(
      { error: "Failed to delete SSE item" },
      { status: 500 }
    );
  }
}
