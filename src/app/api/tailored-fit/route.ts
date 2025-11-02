import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // your Drizzle DB connection
import { taileredFits } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      unit,
      chest,
      underbust,
      waist,
      hips,
      shoulderLength,
      bottomLength,
      additional,
      contact,
    } = body;

    if (!contact || !unit) {
      return NextResponse.json(
        { error: "Unit and contact number are required." },
        { status: 400 }
      );
    }

    const [inserted] = await db
      .insert(taileredFits)
      .values({
        unit,
        chest,
        underbust,
        waist,
        hips,
        shoulderLength,
        bottomLength,
        additional,
        contact,
      })
      .returning();

    return NextResponse.json({ success: true, data: inserted });
  } catch (error) {
    console.error("Error inserting tailored fit data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const data = await db
      .select()
      .from(taileredFits)
      .orderBy(taileredFits.createdAt);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching tailored fit data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
