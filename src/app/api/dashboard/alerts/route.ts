import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { database } from "@/database";
import type { AlertItem } from "@/types/dashboard";
import { UserRole } from "@/types/database";
import {
  mergeAndSortAlerts,
  perscomRowToAlertItem,
  withSystemSource,
} from "@/lib/dashboard/mergeAlertFeeds";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRoles: string[] = session.user.roles || [];
    const isAdmin = userRoles.includes(UserRole.admin);
    const userId = session.user.id!;

    const systemRows = isAdmin
      ? await database.get.allAlerts()
      : await database.get.alerts(userRoles);

    const systemItems: AlertItem[] = (systemRows as AlertItem[]).map(
      withSystemSource
    );

    const perscomRows = isAdmin
      ? await database.get.allPerscomNotifications()
      : session.user.perscomId
        ? await database.get.perscomNotificationsVisibleForUser(
            Number(session.user.perscomId),
            userId
          )
        : [];

    const perscomItems = perscomRows.map((row) =>
      perscomRowToAlertItem(row, { dismissible: !isAdmin })
    );

    const merged = mergeAndSortAlerts(systemItems, perscomItems);

    return NextResponse.json(merged);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.roles?.includes(UserRole.admin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const id = await database.post.alert({
      type: body.type,
      label: body.label,
      message: body.message,
      targetRoles: body.targetRoles,
      expiresAt: body.expiresAt,
      createdBy: session.user.id!,
    });

    return NextResponse.json({ id, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}
