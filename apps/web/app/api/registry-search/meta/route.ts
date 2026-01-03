import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("registry_components")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    count: count ?? 0,
  });
}
