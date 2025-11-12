"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const sizeData = {
  fitted: [
    ["S", "36", "34", "38", "14", "22", "38", "41–43"],
    ["M", "38", "36", "40", "14.5", "23", "40", "43–45"],
    ["L", "40", "38", "42", "15", "24", "42", "45–47"],
    ["XL", "42", "40", "44", "15.5", "25", "44", "47–49"],
    ["XXL", "44", "42", "46", "16", "26", "46", "49–51"],
    ["3XL", "46", "44", "48", "16.5", "27", "48", "51–53"],
    ["4XL", "48", "46", "50", "17", "28", "50", "53–55"],
  ],
  regular: [
    ["S", "37", "35", "40", "14.25", "22", "39", "42–44"],
    ["M", "39", "37", "42", "14.75", "23", "41", "44–46"],
    ["L", "41", "39", "44", "15.25", "24", "43", "46–48"],
    ["XL", "43", "41", "46", "15.75", "25", "45", "48–50"],
    ["XXL", "45", "43", "48", "16.25", "26", "47", "50–52"],
    ["3XL", "47", "45", "50", "16.75", "27", "49", "52–54"],
    ["4XL", "49", "47", "52", "17.25", "28", "51", "54–56"],
  ],
  loose: [
    ["S", "38", "36", "42", "14.5", "22", "40", "43–45"],
    ["M", "40", "38", "44", "15", "23", "42", "45–47"],
    ["L", "42", "40", "46", "15.5", "24", "44", "47–49"],
    ["XL", "44", "42", "48", "16", "25", "46", "49–51"],
    ["XXL", "46", "44", "50", "16.5", "26", "48", "51–53"],
    ["3XL", "48", "46", "52", "17", "27", "50", "53–55"],
    ["4XL", "50", "48", "54", "17.5", "28", "52", "55–57"],
  ],
};

const tableHeaders = [
  "Size",
  "Chest (in)",
  "Waist (in)",
  "Hip (in)",
  "Shoulder (in)",
  "Sleeve (in)",
  "Lower Height (in)",
  "Lower + Heels (in)",
];

export default function SizeGuideSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className=" mb-4 underline px-0" variant="link">
          View Size Guide
        </Button>
      </SheetTrigger>
      {/* <SheetContent side="right" className="w-[90vw] sm:w-[700px]"> */}
      <SheetContent side="right" className="  !w-full !md:w-xl !max-w-xl ">
        <SheetHeader>
          <SheetTitle>Women’s Clothing Size Guide</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Blouse • Suit • Lehenga
          </p>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="h-[85vh] overflow-auto pb-12 px-4">
          {/* Fitted Fit Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Fitted Fit</h3>
            <Table className="border rounded-md">
              <TableHeader>
                <TableRow>
                  {tableHeaders.map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizeData.fitted.map((row, i) => (
                  <TableRow key={i}>
                    {row.map((cell, j) => (
                      <TableCell key={j}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Regular Fit Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Regular Fit</h3>
            <Table className="border rounded-md">
              <TableHeader>
                <TableRow>
                  {tableHeaders.map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizeData.regular.map((row, i) => (
                  <TableRow key={i}>
                    {row.map((cell, j) => (
                      <TableCell key={j}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Loose Fit Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Loose Fit</h3>
            <Table className="border rounded-md">
              <TableHeader>
                <TableRow>
                  {tableHeaders.map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizeData.loose.map((row, i) => (
                  <TableRow key={i}>
                    {row.map((cell, j) => (
                      <TableCell key={j}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Notes Section */}
          <div className="text-sm text-muted-foreground space-y-2">
            <h4 className="font-semibold text-foreground">
              Category Guidance & Notes:
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <b>Fitted fit:</b> Closely follows the body’s contour; best for
                tailored blouses, fitted suits, and mermaid lehengas.
              </li>
              <li>
                <b>Regular fit:</b> Offers moderate ease; works well for classic
                suits, comfort blouses, and A-line lehengas.
              </li>
              <li>
                <b>Loose fit:</b> Maximizes movement and comfort; suited for
                relaxed kurtas, flared lehengas, and oversized tops.
              </li>
              <li>
                <b>Lower Height:</b> Use this for kameez (suits) or lehenga
                skirts from shoulder/waist to hem.
              </li>
              <li>
                <b>Lower Height with Heels:</b> Add 3–5 inches to ensure proper
                floor graze for long garments.
              </li>
              <li>
                Hip and shoulder increments follow standard Indian tailoring
                guidance.
              </li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
