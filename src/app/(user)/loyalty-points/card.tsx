"use client";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Info, SendHorizonal } from "lucide-react";
import React, { useState } from "react";
import { transferLoyaltyPoints } from "@/src/hepler/loyalty/transfer";

const LoyalityCard = ({ logedinUserData }: any) => {
  const [userData, setUserData] = useState({
    name: logedinUserData.name || "",
    email: logedinUserData.email || "",
    points: logedinUserData.loyaltyPoints || 0,
  });
  return (
    <div className="flex justify-center items-center min-h-[80vh] ">
      <Card className="relative min-w-96 rounded-xl shadow-lg border bg-[#2e0e2c] text-white border-gray-200 flex flex-col justify-between  transition-all duration-300 hover:shadow-amber-400/30 hover:scale-[1.02]">
        {/* Header */}
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-base font-semibold">Haus of Privae</h2>
              <p className="text-xs text-gray-300">Loyalty Card</p>
            </div>

            {/* Info Dialog */}
            <InfoCardPoints points={userData.points} />
          </div>
        </CardHeader>

        {/* Dots */}
        <CardContent>
          <div className="flex justify-between items-center ">
            {/* {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full ${
                  i < 5 ? "bg-amber-500" : "border border-gray-400"
                }`}
              ></div>
            ))} */}
          </div>
          {/* Points Display */}
          <div className=" ">
            <p className="text-xs text-gray-100 uppercase">Loyalty Points</p>
            <p className="text-2xl font-bold text-amber-600">
              {userData.points.toLocaleString()} pts
            </p>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter>
          <div className="flex justify-between items-end w-full mt-3">
            <div>
              <p className="text-sm font-medium">
                {userData.name || "Guest User"}
              </p>
              <p className="text-xs text-gray-200">
                {userData.email?.split("@")[0] || "member"}
              </p>
            </div>

            {/* Send Points Dialog */}
            <TransferPoints />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoyalityCard;

function InfoCardPoints({ points }: { points: number }) {
  const valueInINR = (points / 10).toFixed(2);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className=" hover:bg-[#757175] rounded-full ">
          <Info size={14} className=" " />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white text-black border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Points Value
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-sm">
            10 loyalty points = ₹1.00 INR
          </DialogDescription>
        </DialogHeader>
        <div className="mt-3 text-sm">
          You currently have{" "}
          <span className="font-medium">{points.toLocaleString()}</span> points
          - worth approximately{" "}
          <span className="font-medium text-amber-600">₹{valueInINR}</span>.
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TransferPoints() {
  const [transferEmail, setTransferEmail] = useState("");
  const [transferAmount, setTransferAmount] = useState(0);
  async function handleSendPoints() {
    const res = await transferLoyaltyPoints(transferEmail, transferAmount);
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-amber-100 hover:bg-amber-200 p-1.5 transition">
          <SendHorizonal size={14} className="text-amber-700" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white text-black border border-gray-200">
        <DialogHeader>
          <DialogTitle>Send Points</DialogTitle>
          <DialogDescription className="text-gray-600">
            Share your loyalty points with another member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-3">
          <Input
            placeholder="Recipient email"
            value={transferEmail}
            onChange={(e) => setTransferEmail(e.target.value)}
            className="border-gray-300"
          />
          <Input
            placeholder="Points to send"
            type="number"
            value={transferAmount}
            onChange={(e) => setTransferAmount(Number(e.target.value))}
            className="border-gray-300"
          />
          <Button onClick={handleSendPoints} className="  w-full">
            Send Points
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
