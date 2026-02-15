import { NextRequest, NextResponse } from "next/server";
import { lookupBarcode } from "@/lib/api/openfoodfacts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Barcode is required" },
        { status: 400 }
      );
    }

    const result = await lookupBarcode(code);

    if (!result) {
      return NextResponse.json(
        { error: "Product not found. Try searching by name or enter manually." },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to lookup barcode:", error);
    return NextResponse.json(
      { error: "Failed to lookup barcode" },
      { status: 500 }
    );
  }
}
