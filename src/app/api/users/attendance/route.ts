import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { DatabaseClient } from "@/database/DatabaseClient";
import { UserRole } from "@/types/database";

const db = DatabaseClient.getInstance();

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.roles.includes(UserRole.admin)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const users = await db.get.usersForSelection();

    // Filter to only include users with member, tacdevron, or 160th roles
    const filteredUsers = users
      .filter(
        (user) =>
          user.role.includes(UserRole.member) ||
          user.role.includes(UserRole.tacdevron) ||
          user.role.includes(UserRole["160th"])
      )
      .map((user) => ({
        ...user,
        primaryRole: user.role.includes(UserRole.tacdevron)
          ? UserRole.tacdevron
          : user.role.includes(UserRole["160th"])
            ? UserRole["160th"]
            : UserRole.member,
      }));

    return NextResponse.json(filteredUsers);
  } catch (error) {
    console.error("GET /api/users/attendance error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
