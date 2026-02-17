import { NextRequest, NextResponse } from "next/server";
import { prisma, getUserId } from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "daily";
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const digests = await prisma.digest.findMany({
      where: {
        userId,
        type,
      },
      orderBy: { date: "desc" },
      take: limit,
    });

    return NextResponse.json(digests);
  } catch (error) {
    console.error("Failed to fetch digests:", error);
    return NextResponse.json(
      { error: "Failed to fetch digests" },
      { status: 500 }
    );
  }
}
