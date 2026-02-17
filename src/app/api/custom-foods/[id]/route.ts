import { NextRequest, NextResponse } from "next/server";
import { prisma, getUserId } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.customFood.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Custom food not found" }, { status: 404 });
    }

    const food = await prisma.customFood.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(food);
  } catch (error) {
    console.error("Failed to update custom food:", error);
    return NextResponse.json({ error: "Failed to update custom food" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.customFood.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Custom food not found" }, { status: 404 });
    }

    await prisma.customFood.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete custom food:", error);
    return NextResponse.json({ error: "Failed to delete custom food" }, { status: 500 });
  }
}
