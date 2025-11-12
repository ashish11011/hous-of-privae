"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addCoupon, updateCoupon } from "@/src/hepler/coupons/coupon.helper";

const AddUpdateCoupon = ({
  open,
  onOpenChange,
  initialData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}) => {
  const [loading, setLoading] = useState(false);
  const [couponDetails, setCouponDetails] = useState({
    id: undefined,
    name: "",
    description: "",
    code: "",
    discountPercentage: 0,
    discountFixedAmount: 0,
    useOnce: false,
  });

  useEffect(() => {
    if (initialData) setCouponDetails(initialData);
    else
      setCouponDetails({
        id: undefined,
        name: "",
        description: "",
        code: "",
        discountPercentage: 0,
        discountFixedAmount: 0,
        useOnce: false,
      });
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setCouponDetails((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCouponDetails((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (couponDetails.id) {
        await updateCoupon(couponDetails);
        alert("Coupon updated successfully!");
      } else {
        await addCoupon(couponDetails);
        alert("Coupon added successfully!");
      }
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {couponDetails.id ? "Edit Coupon" : "Add New Coupon"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Coupon Name</Label>
            <Input
              id="name"
              name="name"
              value={couponDetails.name}
              onChange={handleChange}
              placeholder="Enter coupon name"
              required
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={couponDetails.description}
              onChange={handleChange}
              placeholder="Enter description"
              required
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="code">Coupon Code</Label>
            <Input
              id="code"
              name="code"
              value={couponDetails.code}
              onChange={handleChange}
              placeholder="Enter coupon code"
              required
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="discountPercentage">Discount Percentage (%)</Label>
            <Input
              id="discountPercentage"
              name="discountPercentage"
              type="number"
              value={couponDetails.discountPercentage}
              onChange={handleChange}
              placeholder="Enter discount %"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="discountFixedAmount">Discount Fixed Amount</Label>
            <Input
              id="discountFixedAmount"
              name="discountFixedAmount"
              type="number"
              value={couponDetails.discountFixedAmount}
              onChange={handleChange}
              placeholder="Enter fixed amount"
            />
          </div>

          <div className="flex items-center w-full space-x-2">
            <Input
              id="useOnce"
              type="checkbox"
              name="useOnce"
              className=" size-5"
              checked={couponDetails.useOnce}
              onChange={handleCheckboxChange}
            />
            <Label htmlFor="useOnce">Allow only one-time use</Label>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading
              ? "Saving..."
              : couponDetails.id
              ? "Update Coupon"
              : "Add Coupon"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUpdateCoupon;
