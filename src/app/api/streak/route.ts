import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/db";
import { getStreak } from "@/lib/streak";

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }

  try {
    const streak = await getStreak(userId);

    return NextResponse.json(streak);
  } catch (error) {
    console.error("Failed to fetch streak:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak" },
      { status: 500 }
    );
  }
}
