import { NextRequest, NextResponse } from "next/server";
import { prisma, getUserId } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.waterEntry.findUnique({ where: { id } });

    if (!existing || existing.userId !== userId) {
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
