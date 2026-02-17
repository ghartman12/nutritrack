import { NextRequest, NextResponse } from "next/server";
import { prisma, getUserId } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });

    if (!user) {
      // Auto-create user with default settings
      user = await prisma.user.create({
        data: {
          id: userId,
          settings: { create: {} },
          streak: { create: {} },
        },
        include: { settings: true },
      });
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
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const body = await request.json();

    const settings = await prisma.userSettings.update({
      where: { userId },
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
