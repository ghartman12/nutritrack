import { NextRequest, NextResponse } from "next/server";
import { prisma, DEFAULT_USER_ID } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.waterEntry.findUnique({ where: { id } });

    if (!existing || existing.userId !== DEFAULT_USER_ID) {
      return NextResponse.json(
        { error: "Water entry not found" },
        { status: 404 }
      );
    }

    await prisma.waterEntry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete water entry:", error);
    return NextResponse.json(
      { error: "Failed to delete water entry" },
      { status: 500 }
    );
  }
}
