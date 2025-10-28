import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { user } from "@/db/userSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      number,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
    } = body;

    const session = await getServerSession(authOptions);
    const userId = session?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🧾 Validate at least one field is present
    if (!name && !email && !number) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 }
      );
    }

    // 🛠️ Prepare update object dynamically (so null/undefined values aren't set)
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (number !== undefined) updateData.number = number;
    if (number !== undefined) updateData.addressLine1 = addressLine1;
    if (number !== undefined) updateData.addressLine2 = addressLine2;
    if (number !== undefined) updateData.city = city;
    if (number !== undefined) updateData.state = state;
    if (number !== undefined) updateData.pincode = pincode;

    const result = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, userId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: result[0],
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
