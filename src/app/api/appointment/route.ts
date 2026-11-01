import { accountApi, accountJson } from "@/lib/account/api";
import { bookedAppointmentTimes, bookAppointment } from "@/lib/account/atelier";
export async function GET() { try { return accountJson({ success: true, bookedTimes: await bookedAppointmentTimes() }); } catch { return accountJson({ success: false, error: "Unable to load appointment availability." }, 503); } }
export async function POST(req: Request) { return accountApi(async userId => bookAppointment(userId, await req.json())); }
