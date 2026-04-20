import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.roles.includes(UserRole.admin)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const data = await req.json();
    await database.put.campaign(id, {
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`PUT /api/campaigns/${id} error:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.roles.includes(UserRole.admin)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    await database.delete.campaign(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/campaigns/${id} error:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
