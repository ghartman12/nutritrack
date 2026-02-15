import { NextResponse } from "next/server";
import { getStreak } from "@/lib/streak";

export async function GET() {
  try {
    const streak = await getStreak();

    return NextResponse.json(streak);
  } catch (error) {
    console.error("Failed to fetch streak:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak" },
      { status: 500 }
    );
  }
}
