import { getUserByEmail } from "@/lib/auth/getUserTypeFromEmail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import ProfileDashboard from "./ProfileDashboard";
import { getUserOrderData } from "@/src/hepler/order/getAllOrderList";
import { getAppointments } from "@/lib/account/resources";
import { accountSchemaMissing } from "@/lib/account/api";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth/adminEmails";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.id || !session.email) {
    redirect("/auth/login?callbackUrl=/profile");
  }

  const [user, orders, appointments] = await Promise.all([
    getUserByEmail(session.email),
    getUserOrderData(),
    getAppointments(session.id).catch((error) => {
      if (accountSchemaMissing(error)) return [];
      throw error;
    }),
  ]);
  if (!user) redirect("/auth/login?callbackUrl=/profile");

  const {
    name,
    email,
    number,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    loyaltyPoints,
  } = user;
  return (
    <ProfileDashboard
      isAdmin={isAdminEmail(session.email)}
      userData={{
        name,
        email,
        number,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        loyaltyPoints,
      }}
      orders={orders
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((order) => ({
          id: order.id,
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalAmountPaid: order.totalAmountPaid,
          totalAmount:
            order.checkoutSnapshot?.totalAmountPaid ??
            (order.expectedAmountPaise !== null
              ? order.expectedAmountPaise / 100
              : order.totalAmountPaid),
          items:
            order.checkoutSnapshot?.items.map((item) => ({
              name: item.name,
              image: item.image,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              unitPrice: item.unitPrice,
            })) ?? [],
          pointsPending: order.checkoutSnapshot?.circle?.normalPoints ?? 0,
          createdAt: order.createdAt.toISOString(),
        }))}
      appointments={appointments.map((appointment) => ({
        id: appointment.id,
        service: appointment.service,
        scheduled: appointment.scheduledFor.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
      }))}
    />
  );
}
