import { NextResponse } from "next/server";

import { getLocalRegistryIndex } from "@/lib/registry-local-index";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from("registry_components")
      .select("id", { count: "exact", head: true });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      count: count ?? 0,
    });
  } catch (error) {
    try {
      const index = await getLocalRegistryIndex();
      return NextResponse.json({
        count: index.count ?? index.items?.length ?? 0,
      });
    } catch (fallbackError) {
      let message = "Failed to load search metadata.";
      if (fallbackError instanceof Error) {
        message = fallbackError.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
}
