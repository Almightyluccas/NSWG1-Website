import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import { UserRole } from "@/types/database";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const showAll = request.nextUrl.searchParams.get("all") === "true";
    const isAdmin = session.user.roles?.includes(UserRole.admin);

    const directives =
      showAll && isAdmin
        ? await database.get.allDirectives()
        : await database.get.directives(session.user.id!);

    return NextResponse.json(directives);
  } catch (error) {
    console.error("Error fetching directives:", error);
    return NextResponse.json(
      { error: "Failed to fetch directives" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Support bulk assignment via userIds array
    if (
      body.userIds &&
      Array.isArray(body.userIds) &&
      body.userIds.length > 0
    ) {
      await database.post.bulkDirectives(
        {
          label: body.label,
          description: body.description,
          assignedBy: session.user.id!,
          dueDate: body.dueDate,
        },
        body.userIds
      );
      return NextResponse.json(
        { success: true, count: body.userIds.length },
        { status: 201 }
      );
    }

    // Single directive
    const id = await database.post.directive({
      label: body.label,
      description: body.description,
      userId: body.userId,
      assignedBy: session.user.id!,
      dueDate: body.dueDate,
    });

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating directive:", error);
    return NextResponse.json(
      { error: "Failed to create directive" },
      { status: 500 }
    );
  }
}
