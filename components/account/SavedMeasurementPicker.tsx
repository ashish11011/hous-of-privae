"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { Measurement } from "@/lib/account/types";
import { accountRequest } from "./shared";
export default function SavedMeasurementPicker({
  onSelect,
}: {
  onSelect: (measurement: Measurement) => void;
}) {
  const { status } = useSession();
  const [sets, setSets] = useState<Measurement[]>([]);
  useEffect(() => {
    if (status === "authenticated")
      void accountRequest<Measurement[]>("measurements")
        .then(setSets)
        .catch(() => {});
  }, [status]);
  if (!sets.length) return null;
  return (
    <div className="border border-primary/20 bg-primary/5 p-3 space-y-2">
      <label
        htmlFor="saved-fit-measurement"
        className="block text-xs font-body uppercase tracking-[0.12em]"
      >
        Use saved measurements
      </label>
      <select
        id="saved-fit-measurement"
        defaultValue=""
        className="w-full border bg-background px-3 py-2 text-sm"
        onChange={(event) => {
          const selected = sets.find((row) => row.id === event.target.value);
          if (selected) onSelect(selected);
        }}
      >
        <option value="">Choose a measurement set</option>
        {sets.map((set) => (
          <option key={set.id} value={set.id}>
            {set.label} ({set.unit})
          </option>
        ))}
      </select>
    </div>
  );
}
