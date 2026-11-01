"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BESPOKE_LABELS, BESPOKE_STAGES } from "@/lib/account/rules";
import type { Appointment, Bespoke } from "@/lib/account/types";
import { accountDate } from "@/components/account/shared";
import { toast } from "sonner";
type Booking = Appointment & { name: string; email: string; phone: string };
export default function AtelierAdmin() {
  const [commissions, setCommissions] = useState<Bespoke[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"bespoke" | "appointments">("bespoke");
  const [editing, setEditing] = useState<Bespoke | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const loadVersion = useRef(0);
  async function load() {
    const version = ++loadVersion.current;
    try {
      const response = await fetch("/api/admin/atelier/", {
        cache: "no-store",
        redirect: "error",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      if (version === loadVersion.current) {
        setCommissions(data.commissions);
        setBookings(data.bookings);
        setError("");
        setSaveError("");
      }
      return data as { commissions: Bespoke[]; bookings: Booking[] };
    } catch (failure) {
      if (version === loadVersion.current) setError((failure as Error).message);
    } finally {
      if (version === loadVersion.current) setLoading(false);
    }
  }
  useEffect(() => {
    void load();
    return () => {
      loadVersion.current++;
    };
  }, []);
  async function update(body: {
    kind: string;
    id: string;
    status: string;
    [key: string]: unknown;
  }) {
    // A listing request started before this write must not replace its result.
    loadVersion.current++;
    setBusy(true);
    setSaveError("");
    try {
      const response = await fetch("/api/admin/atelier/", {
        method: "POST",
        redirect: "error",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message);
      if (payload.success !== true || payload.data?.id !== body.id)
        throw new Error("The update was not confirmed. Refresh and try again.");
      if (
        payload.data.status !== body.status ||
        (body.kind === "bespoke" &&
          (payload.data.currentMilestone !== body.milestone ||
            payload.data.estimatedDeliveryDate !==
              (body.estimatedDeliveryDate || null) ||
            !Array.isArray(payload.data.milestones)))
      )
        throw new Error("The update was not confirmed. Refresh and try again.");
      if (body.kind === "bespoke") {
        setCommissions((current) =>
          current.map((row) => (row.id === body.id ? payload.data : row)),
        );
      } else {
        setBookings((current) =>
          current.map((row) =>
            row.id === body.id ? { ...row, ...payload.data } : row,
          ),
        );
      }
      setError("");
      setEditing(null);
      toast.success("Atelier request updated.");
    } catch (failure) {
      setSaveError((failure as Error).message);
      toast.error((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="w-full min-w-0 p-4 md:p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Atelier Requests</h1>
        <p className="text-sm text-muted-foreground">
          Update customer appointments and publish bespoke production
          milestones.
        </p>
      </header>
      <div className="flex gap-3">
        <Button
          variant={tab === "bespoke" ? "default" : "outline"}
          onClick={() => setTab("bespoke")}
        >
          Bespoke commissions
        </Button>
        <Button
          variant={tab === "appointments" ? "default" : "outline"}
          onClick={() => setTab("appointments")}
        >
          Appointments
        </Button>
        <Button disabled={busy} variant="outline" onClick={() => void load()}>
          Refresh
        </Button>
      </div>
      {error && (
        <p role="status" className="border p-4 text-sm">
          {error}
        </p>
      )}
      {saveError && (
        <p
          role="alert"
          className="border border-destructive p-4 text-sm text-destructive"
        >
          {saveError}
        </p>
      )}
      {loading ? (
        <p>Loading atelier requests…</p>
      ) : tab === "bespoke" ? (
        <div className="grid lg:grid-cols-2 gap-5">
          {!commissions.length && !error && <p>No bespoke commissions yet.</p>}
          {commissions.map((request) => (
            <article key={request.id} className="border bg-card p-5 space-y-3">
              <div className="flex justify-between gap-3">
                <h2 className="text-lg">{request.garmentType}</h2>
                <span className="text-xs uppercase">
                  {request.status.replaceAll("_", " ")}
                </span>
              </div>
              <p className="text-sm">
                {request.fullName} · {request.email} · {request.phone}
              </p>
              <p className="text-xs text-muted-foreground">
                Submitted {accountDate(request.createdAt)} · {request.occasion}{" "}
                · {request.budgetRange}
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {request.inspirationNotes}
              </p>
              <p className="text-xs">
                Fabric: {request.fabricPreference || "—"} · Colour:{" "}
                {request.colorPreference || "—"}
              </p>
              <p className="text-sm text-primary">
                {
                  BESPOKE_LABELS[
                    request.currentMilestone as keyof typeof BESPOKE_LABELS
                  ]
                }
              </p>
              <details className="border-t pt-3">
                <summary className="cursor-pointer text-sm">
                  Published production updates ({request.milestones.length})
                </summary>
                <ol className="space-y-3 mt-3">
                  {request.milestones.map((milestone) => (
                    <li key={milestone.id} className="text-sm border-l pl-3">
                      <p>
                        {BESPOKE_LABELS[
                          milestone.milestone as keyof typeof BESPOKE_LABELS
                        ] ?? milestone.milestone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {accountDate(milestone.createdAt, true)}
                      </p>
                      {milestone.note && (
                        <p className="whitespace-pre-wrap mt-1">
                          {milestone.note}
                        </p>
                      )}
                      {milestone.imageUrl && (
                        <a
                          href={milestone.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                        >
                          View progress image
                        </a>
                      )}
                    </li>
                  ))}
                </ol>
              </details>
              <Button variant="outline" onClick={() => setEditing(request)}>
                Update production timeline
              </Button>
              {editing?.id === request.id && (
                <form
                  className="space-y-3 border-t pt-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const values = new FormData(event.currentTarget);
                    void update({
                      kind: "bespoke",
                      id: request.id,
                      status: String(values.get("status") ?? ""),
                      milestone: values.get("milestone"),
                      note: values.get("note"),
                      imageUrl: values.get("imageUrl"),
                      estimatedDeliveryDate: values.get("delivery"),
                      expectedUpdatedAt: editing.updatedAt,
                    });
                  }}
                >
                  <fieldset disabled={busy} className="space-y-3">
                    <div>
                      <Label>Status</Label>
                      <select
                        name="status"
                        defaultValue={request.status}
                        className="w-full border p-2 bg-background"
                      >
                        {[
                          "submitted",
                          "in_progress",
                          "completed",
                          "cancelled",
                        ].map((status) => (
                          <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Production stage</Label>
                      <select
                        name="milestone"
                        defaultValue={request.currentMilestone}
                        className="w-full border p-2 bg-background"
                      >
                        {BESPOKE_STAGES.map((stage) => (
                          <option key={stage} value={stage}>
                            {BESPOKE_LABELS[stage]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Customer-visible note</Label>
                      <Textarea name="note" maxLength={2000} />
                    </div>
                    <div>
                      <Label>Progress image URL (optional)</Label>
                      <Input name="imageUrl" type="url" />
                    </div>
                    <div>
                      <Label>Estimated delivery</Label>
                      <Input
                        name="delivery"
                        type="date"
                        defaultValue={request.estimatedDeliveryDate ?? ""}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Save update</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </fieldset>
                </form>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {!bookings.length && !error && <p>No appointments yet.</p>}
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="border p-5 flex flex-wrap justify-between gap-4"
            >
              <div>
                <h2 className="text-lg">{booking.service}</h2>
                <p className="text-sm">
                  {booking.name} · {booking.email} · {booking.phone}
                </p>
                <p className="text-sm mt-2">
                  {accountDate(booking.scheduledFor, true)} ·{" "}
                  {booking.durationMinutes} min
                </p>
                {booking.notes && (
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                    {booking.notes}
                  </p>
                )}
                <p className="text-xs uppercase mt-3">{booking.status}</p>
              </div>
              <div className="flex flex-wrap gap-2 items-start">
                {booking.status === "requested" && (
                  <Button
                    disabled={busy}
                    onClick={() =>
                      void update({
                        kind: "appointment",
                        id: booking.id,
                        status: "confirmed",
                      })
                    }
                  >
                    Confirm
                  </Button>
                )}
                {booking.status === "confirmed" && (
                  <Button
                    disabled={busy}
                    onClick={() =>
                      void update({
                        kind: "appointment",
                        id: booking.id,
                        status: "completed",
                      })
                    }
                  >
                    Mark completed
                  </Button>
                )}
                {["requested", "confirmed"].includes(booking.status) && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      void update({
                        kind: "appointment",
                        id: booking.id,
                        status: "cancelled",
                      })
                    }
                  >
                    Cancel appointment
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
