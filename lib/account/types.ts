import type {
  accountAddress,
  accountMeasurement,
  accountProfile,
  accountAppointment,
  accountStockAlert,
  bespokeRequest,
  bespokeMilestone,
} from "@/db/accountSchema";
import type { getCircleSummary } from "./circle";
export type JsonValue<T> = T extends Date
  ? string
  : T extends ReadonlyArray<infer U>
    ? JsonValue<U>[]
    : T extends object
      ? { [K in keyof T]: JsonValue<T[K]> }
      : T;
export type Address = JsonValue<typeof accountAddress.$inferSelect>;
export type Measurement = JsonValue<typeof accountMeasurement.$inferSelect>;
export type Appointment = JsonValue<typeof accountAppointment.$inferSelect>;
export type Bespoke = JsonValue<typeof bespokeRequest.$inferSelect> & {
  milestones: JsonValue<typeof bespokeMilestone.$inferSelect>[];
};
export type Circle = JsonValue<Awaited<ReturnType<typeof getCircleSummary>>>;
export type StockAlert = JsonValue<typeof accountStockAlert.$inferSelect>;
export type Dossier = {
  name: string | null;
  number: string | null;
  email: string;
  dateOfBirth: string;
  preferredTopSize: string;
  preferredBottomSize: string;
  preferredBlouseSize: string;
};
export type AccountOrder = {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmountPaid: number | null;
  totalAmount: number | null;
  createdAt: string;
  items: {
    name: string;
    image?: string;
    quantity: number;
    size?: string | null;
    color?: string | null;
    unitPrice: number;
  }[];
  pointsPending: number;
};
