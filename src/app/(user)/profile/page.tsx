"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getUserByEmail } from "@/lib/auth/getUserTypeFromEmail";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/button-group";

export default function ProfilePage() {
  const sessionData: any = useSession();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    number: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const userData = await getUserByEmail(sessionData?.data?.email);
      if (userData) {
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          number: userData.number || "",
          addressLine1: userData.addressLine1 || "",
          addressLine2: userData.addressLine2 || "",
          city: userData.city || "",
          state: userData.state || "",
          pincode: userData.pincode || "",
        });
      }
    }
    if (sessionData?.data?.email) fetchUser();
  }, [sessionData?.data?.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      alert("Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-16">
      <CurrencyConverter />

      <div className=" border rounded-lg shadow p-8 space-y-6">
        <Toaster position="top-right" />
        <h2 className="text-2xl font-semibold text-center">Update Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  disabled
                  value={formData.email}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number">Phone Number</Label>
                <Input
                  id="number"
                  name="number"
                  type="number"
                  required
                  className="appearance-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  placeholder="Enter your phone number"
                  value={formData.number}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address Details</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input
                  id="addressLine1"
                  name="addressLine1"
                  placeholder="House No, Street Name"
                  required
                  value={formData.addressLine1}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  name="addressLine2"
                  placeholder="Apartment, Landmark (optional)"
                  value={formData.addressLine2}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Enter city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Enter state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    placeholder="Enter pincode"
                    required
                    type="number"
                    className="appearance-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    value={formData.pincode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? "Saving..." : "Update Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function CurrencyConverter() {
  const [defaultType, setDefaultType] = useState("INR");

  useEffect(() => {
    const currency = localStorage.getItem("currency");
    if (currency) {
      setDefaultType(currency);
    }
  });

  function handleCurrencyChange(currency: string) {
    localStorage.setItem("currency", currency);
    toast.success("Currency changed to " + currency);
    setDefaultType(currency);
  }
  return (
    <div className=" my-12">
      <p className=" text-xl capitalize mb-1">change currency </p>
      <ButtonGroup>
        <Button
          className={cn(defaultType === "INR" ? "bg-gray-100" : "")}
          onClick={() => handleCurrencyChange("INR")}
          variant={"outline"}
        >
          INR
        </Button>
        <Button
          className={cn(defaultType === "USD" ? "bg-gray-100" : "")}
          onClick={() => handleCurrencyChange("USD")}
          variant={"outline"}
        >
          USD
        </Button>
      </ButtonGroup>
    </div>
  );
}
