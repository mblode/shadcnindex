import { NextResponse } from "next/server";

import { getRegistryDirectoryMap } from "@/lib/registry-directory";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  try {
    const registries = await getRegistryDirectoryMap();
    return NextResponse.json({ registries });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load registry directory.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
