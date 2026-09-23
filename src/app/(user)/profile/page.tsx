import { getUserByEmail } from "@/lib/auth/getUserTypeFromEmail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import ProfileDashboard from "./ProfileDashboard";
import { getUserOrderData } from "@/src/hepler/order/getAllOrderList";
import { db } from "@/lib/db";
import { contactTable } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.email) {
    redirect("/auth/login?callbackUrl=/profile");
  }

  const [user, orders, appointments] = await Promise.all([
    getUserByEmail(session.email),
    getUserOrderData(),
    db.select({ id: contactTable.id, message: contactTable.message })
      .from(contactTable)
      .where(and(eq(contactTable.email, session.email), eq(contactTable.location, "appointment")))
      .orderBy(desc(contactTable.createdAt)),
  ]);
  if (!user) redirect("/auth/login?callbackUrl=/profile");

  const { name, email, number, addressLine1, addressLine2, city, state, pincode, loyaltyPoints } = user;
  return <ProfileDashboard
    userData={{ name, email, number, addressLine1, addressLine2, city, state, pincode, loyaltyPoints }}
    orders={orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(order => ({
      id: order.id, status: order.status, totalAmountPaid: order.totalAmountPaid,
      createdAt: order.createdAt.toISOString(),
    }))}
    appointments={appointments.map(appointment => ({
      id: appointment.id,
      service: appointment.message?.match(/^Service: (.+)$/m)?.[1] ?? "Private appointment",
      scheduled: appointment.message?.match(/^Scheduled: (.+)$/m)?.[1] ?? "Schedule to be confirmed",
    }))}
  />;
}
