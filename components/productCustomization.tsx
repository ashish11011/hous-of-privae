import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import Link from "next/link";

export default function TailoredFitFormModal() {
  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState<"inches" | "cm">("inches");
  const [form, setForm] = useState({
    chest: "",
    underbust: "",
    waist: "",
    hips: "",
    shoulderLength: "",
    bottomLength: "",
    additional: "",
    contact: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.contact.trim()) {
      alert("Please provide a contact number.");
      return;
    }
    const payload = { unit, ...form };
    const res = await fetch("/api/tailored-fit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const resMsg = await res.json();
    // if (resMsg.status !== 200) {
    //   //   const resMsg = await res.json();
    //   alert(resMsg.message);
    //   throw new Error(resMsg.message);
    // }
    setSubmitted(true);
    handleReset();
    setTimeout(() => setOpen(false), 2000);
  }

  function handleReset() {
    setForm({
      chest: "",
      underbust: "",
      waist: "",
      hips: "",
      shoulderLength: "",
      bottomLength: "",
      additional: "",
      contact: "",
    });
    setUnit("inches");
    setSubmitted(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className=" mt-4" variant="default">
          Open Tailored Fit Form
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[80vh] md:max-h-[96vh] overflow-auto pt-10 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tailored Fit / Alterations Measurement Form</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-2 block">Select Unit of Measurement</Label>
            <div className="flex gap-4 items-center">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="unit"
                  value="inches"
                  checked={unit === "inches"}
                  onChange={() => setUnit("inches")}
                  className="accent-slate-700"
                />
                <span>Inches</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="unit"
                  value="cm"
                  checked={unit === "cm"}
                  onChange={() => setUnit("cm")}
                  className="accent-slate-700"
                />
                <span>Centimeters</span>
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="chest">Chest</Label>
            <Input
              id="chest"
              name="chest"
              value={form.chest}
              onChange={handleChange}
              placeholder={`e.g. 36 ${unit}`}
            />
          </div>

          <div>
            <Label htmlFor="underbust">Underbust</Label>
            <Input
              id="underbust"
              name="underbust"
              value={form.underbust}
              onChange={handleChange}
              placeholder={`e.g. 30 ${unit}`}
            />
          </div>

          <div>
            <Label htmlFor="waist">Waist</Label>
            <Input
              id="waist"
              name="waist"
              value={form.waist}
              onChange={handleChange}
              placeholder={`e.g. 28 ${unit}`}
            />
          </div>

          <div>
            <Label htmlFor="hips">Hips</Label>
            <Input
              id="hips"
              name="hips"
              value={form.hips}
              onChange={handleChange}
              placeholder={`e.g. 38 ${unit}`}
            />
          </div>

          <div>
            <Label htmlFor="shoulderLength">Shoulder Length</Label>
            <Input
              id="shoulderLength"
              name="shoulderLength"
              value={form.shoulderLength}
              onChange={handleChange}
              placeholder={`e.g. 16 ${unit}`}
            />
          </div>

          <div>
            <Label htmlFor="bottomLength">
              Bottom Length (Pant/Skirt length)
            </Label>
            <Input
              id="bottomLength"
              name="bottomLength"
              value={form.bottomLength}
              onChange={handleChange}
              placeholder={`e.g. 40 ${unit}`}
            />
          </div>

          <div>
            <Label htmlFor="additional">
              Additional Requests / Instructions
            </Label>
            <textarea
              id="additional"
              name="additional"
              value={form.additional}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring"
              placeholder="Any special requests or clarifications"
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Note: An additional charge of <strong>₹1000</strong> applies for all
            tailored fit requests.
            <br />
            For any customization requests or clarifications, you may reach out
            to us at{" "}
            <Link className="underline" href="tel:+917023117408">
              +91 7023117408
            </Link>{" "}
            or{" "}
            <Link
              className="underline"
              href="mailto:queries.hausofprivae@gmail.com"
            >
              queries.hausofprivae@gmail.com
            </Link>
            .
          </p>

          <div>
            <Label htmlFor="contact">Customer Contact Number</Label>
            <Input
              id="contact"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          {submitted && (
            <div className="p-3 bg-green-50 border rounded-md text-green-800 text-sm">
              Thank you - your tailored fit request has been recorded. We will
              contact you shortly.{" "}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
