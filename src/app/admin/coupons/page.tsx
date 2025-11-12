"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import AddUpdateCoupon from "./addNewCoupon";
import { getAllCoupons } from "@/src/hepler/coupons/coupon.helper";

const CouponsList = () => {
  const [coupons, setCoupons] = useState<any>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddNew = () => {
    setSelectedCoupon(null); // clear state for new
    setDialogOpen(true);
  };

  useEffect(() => {
    async function getData() {
      const data = await getAllCoupons();
      setCoupons(data);
    }
    getData();
  }, []);

  const handleEdit = (coupon: any) => {
    setSelectedCoupon(coupon); // set current coupon
    setDialogOpen(true);
  };

  return (
    <div className="p-4">
      {/* Add New */}
      <Button onClick={handleAddNew}>Add New Coupon</Button>

      {/* Coupon List */}
      <table className="mt-4 w-full border-collapse">
        <tbody>
          {coupons?.map((coupon: any, idx: number) => (
            <tr key={coupon.id} className="border-b">
              <td className="p-2 w-10">{idx + 1}</td>
              <td className="p-2">{coupon.name}</td>
              <td className="p-2">{coupon.code}</td>
              <td className="p-2">
                <button
                  onClick={() => handleEdit(coupon)}
                  className="text-[#3c0d0d] hover:opacity-80"
                >
                  <Pencil size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add / Edit Dialog */}
      <AddUpdateCoupon
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={selectedCoupon}
      />
    </div>
  );
};

export default CouponsList;
