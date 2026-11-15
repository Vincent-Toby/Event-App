import { NextResponse, type NextRequest } from "next/server";
import { getSuggestions } from "@/lib/search-query";

export async function GET(request: NextRequest) {
  // Read the query first, then the current time.
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const suggestions = await getSuggestions(q, new Date());
  return NextResponse.json({ suggestions });
}
