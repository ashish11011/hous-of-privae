"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
// import { convertS3ToImageKit } from "@/helper/imagekit";
import {
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableRow } from "../ui/table";
import { useStore } from "@/hepler/store/zustand";
import { CartProduct } from "@/types";

export function CartSheet() {
  const {
    productStore: cart,
    removeItemFromStore,
    increaseQuantity,
    decreaseQuantity,
  } = useStore();

  const cartQuentity = cart?.length;
  const router = useRouter();
  function handleProcedeToCheckout() {
    router.push("/checkout");
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative cursor-pointer px-2 py-1.5 text-sm duration-300  md:px-3 md:text-base">
          <ShoppingBag />
          <span className="absolute   -top-1 right-1 z-10 ">
            {cartQuentity}
          </span>
        </div>
      </SheetTrigger>
      <SheetContent className=" bg-gray-100   w-full overflow-y-auto sm:min-w-[36rem]">
        <SheetHeader>
          <SheetTitle className=" ">Your Cart</SheetTitle>
        </SheetHeader>
        <div className=" px-4 mt-4">
          {cartQuentity === 0 ? (
            <div className="flex  justify-center items-center gap-4 opacity-60 mt-12 ">
              <ShoppingCart size={52} />
              <p className="text-center text-lg font-semibold ">
                Your cart is empty
              </p>
            </div>
          ) : (
            <div className="  gap-4">
              {cart.map((item: CartProduct) => (
                <div key={item.id} className=" flex gap-1 py-4">
                  <div className="col-span-1 flex w-full flex-col gap-3 md:flex-row  md:space-x-4">
                    <div className="relative w-16 h-auto shrink-0 rounded-lg md:w-20">
                      <Image
                        // src={}
                        // src={convertS3ToImageKit(item.image)}
                        src={item.bannerImage}
                        alt={item.name}
                        height={100}
                        width={100}
                        className="rounded object-cover"
                      />
                      <div className=" flex flex-col justify-between gap-2">
                        <p
                          className=" p-1.5 rounded-full bg-neutral-400 absolute -top-2 -left-2 cursor-pointer"
                          onClick={() =>
                            removeItemFromStore({
                              id: item.id,
                              color: item.color,
                              size: item.size,
                            })
                          }
                        >
                          <X size={14} />
                        </p>
                      </div>
                    </div>
                    <div className=" flex  flex-col gap-3">
                      <h3 className="line-clamp-2 text-sm text-neutral-800 md:text-lg">
                        {item.name}
                      </h3>
                      <div className=" flex items-center gap-4">
                        <div
                          style={{ backgroundColor: item.color }}
                          className=" size-7 rounded-full shrink-0"
                        ></div>
                        <p className=" whitespace-nowrap">Size: {item.size}</p>
                      </div>
                    </div>
                  </div>

                  <div className=" flex flex-col justify-between gap-2">
                    <div className="col-span-1 text-right text-lg text-green-700">
                      ₹{(item.basePrice * item.quantity).toFixed(2)}
                    </div>
                    <div className="col-span-1 border border-gray-400  rounded-3xl overflow-hidden flex h-fit items-center justify-end  gap-2">
                      <button
                        className="flex items-center justify-center hover:bg-neutral-200 cursor-pointer px-3 py-2 duration-200 h-full w-full "
                        onClick={() =>
                          decreaseQuantity({
                            id: item.id,
                            color: item.color,
                            size: item.size,
                          })
                        }
                      >
                        <Minus size={16} />
                      </button>
                      <span className="">{item.quantity}</span>
                      <button
                        className="flex items-center justify-center hover:bg-neutral-200 cursor-pointer px-3 py-2 duration-200 h-full w-full "
                        onClick={() =>
                          increaseQuantity({
                            id: item.id,
                            color: item.color,
                            size: item.size,
                          })
                        }
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <SheetFooter className="mt-auto w-full ">
          {cartQuentity > 0 && (
            <div className="  w-full">
              <Table>
                <TableBody>
                  <TableRow className=" hover:bg-neutral-200">
                    <TableHead>Taxes</TableHead>
                    <TableCell className=" w-52 text-xl">Rs 0</TableCell>
                  </TableRow>

                  <TableRow className=" hover:bg-neutral-200">
                    <TableHead>Shipping</TableHead>
                    <TableHead>Yet to caluclate</TableHead>
                  </TableRow>
                  <TableRow className=" hover:bg-neutral-200">
                    <TableHead>Total</TableHead>
                    <TableCell className=" w-52 text-xl">
                      Rs{" "}
                      {cart
                        .reduce(
                          (total: number, item: CartProduct) =>
                            total + item.basePrice * item.quantity,
                          0
                        )
                        .toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Button
                onClick={handleProcedeToCheckout}
                className=" w-full py-2 mt-3 rounded-xl  h-11   font-semibold text-lg"
                type="submit"
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
