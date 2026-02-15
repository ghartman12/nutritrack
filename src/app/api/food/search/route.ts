import { NextRequest, NextResponse } from "next/server";
import { searchUSDA } from "@/lib/api/usda";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const results = await searchUSDA(query);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to search USDA:", error);
    return NextResponse.json(
      { error: "Failed to search food database" },
      { status: 500 }
    );
  }
}
