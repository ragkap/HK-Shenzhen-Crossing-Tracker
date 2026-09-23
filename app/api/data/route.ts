import { NextResponse } from "next/server";
import { fetchDailyRows } from "@/lib/data";

export const revalidate = 21600; // 6h — source updates once a day

export async function GET() {
  try {
    const { rows, asOf } = await fetchDailyRows();
    return NextResponse.json({ rows, asOf });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
