"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TailoredFitEntry {
  id: string;
  unit: string;
  chest: string | null;
  underbust: string | null;
  waist: string | null;
  hips: string | null;
  shoulderLength: string | null;
  bottomLength: string | null;
  additional: string | null;
  contact: string;
  createdAt: string;
}

export default function TailoredFitTable() {
  const [data, setData] = useState<TailoredFitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/tailored-fit");
        const json = await res.json();
        setData(json.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredData = data.filter((entry) =>
    entry.contact.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-10 text-muted-foreground">
        Loading tailored fit entries...
      </div>
    );
  }

  return (
    <Card className="shadow-sm w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            Tailored Fit Requests
          </CardTitle>
          {/* <div className="flex items-center gap-2">
            <Input
              placeholder="Search by contact..."
              className="w-56"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={() => setSearch("")}>
              Clear
            </Button>
          </div> */}
        </div>
      </CardHeader>
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            No tailored fit entries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Chest</TableHead>
                  <TableHead>Underbust</TableHead>
                  <TableHead>Waist</TableHead>
                  <TableHead>Hips</TableHead>
                  <TableHead>Shoulder</TableHead>
                  <TableHead>Bottom</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{entry.unit}</Badge>
                    </TableCell>
                    <TableCell>{entry.chest || "-"}</TableCell>
                    <TableCell>{entry.underbust || "-"}</TableCell>
                    <TableCell>{entry.waist || "-"}</TableCell>
                    <TableCell>{entry.hips || "-"}</TableCell>
                    <TableCell>{entry.shoulderLength || "-"}</TableCell>
                    <TableCell>{entry.bottomLength || "-"}</TableCell>
                    <TableCell>{entry.contact}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {entry.additional || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
