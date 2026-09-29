import { Metadata } from "next";
import AppointmentBookingForm from "@/components/refined/AppointmentBookingForm";

export const metadata: Metadata = {
  title: "Privae Studio — Visit Our Atelier",
  description:
    "Choose a private Jaipur studio visit, virtual fitting, or bespoke consultation with Haus of Privae.",
  alternates: { canonical: "https://www.hausofprivae.com/appointment" },
};

export default function AppointmentPage() {
  return <AppointmentBookingForm />;
}
