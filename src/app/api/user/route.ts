import { NextRequest, NextResponse } from "next/server";
import { prisma, DEFAULT_USER_ID } from "@/lib/db";

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID },
      include: { settings: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const settings = await prisma.userSettings.update({
      where: { userId: DEFAULT_USER_ID },
      data: body,
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to update user settings:", error);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    );
  }
}
