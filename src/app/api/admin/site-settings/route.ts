import { getLandingSettings, normalizeLandingSettings, upsertLandingSettings } from "@/lib/siteSettings";
import { NextResponse } from "next/server";

export async function GET() {
  const settings = await getLandingSettings();
  return NextResponse.json({ success: true, data: settings });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const settings = normalizeLandingSettings(body);
    const data = await upsertLandingSettings(settings);

    return NextResponse.json({
      success: true,
      message: "Landing settings updated successfully.",
      data,
    });
  } catch (error) {
    console.error("Site settings update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update landing settings." },
      { status: 500 }
    );
  }
}
