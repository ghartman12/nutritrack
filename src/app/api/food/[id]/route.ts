import { NextRequest, NextResponse } from "next/server";
import { prisma, DEFAULT_USER_ID } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.foodEntry.findUnique({ where: { id } });

    if (!existing || existing.userId !== DEFAULT_USER_ID) {
      return NextResponse.json(
        { error: "Food entry not found" },
        { status: 404 }
      );
    }

    const entry = await prisma.foodEntry.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Failed to update food entry:", error);
    return NextResponse.json(
      { error: "Failed to update food entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.foodEntry.findUnique({ where: { id } });

    if (!existing || existing.userId !== DEFAULT_USER_ID) {
      return NextResponse.json(
        { error: "Food entry not found" },
        { status: 404 }
      );
    }

    await prisma.foodEntry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete food entry:", error);
    return NextResponse.json(
      { error: "Failed to delete food entry" },
      { status: 500 }
    );
  }
}
