"use client";
import { DOLLAR_CONVERSION_VALUE } from "@/const";
import { formatNumberWithCommas } from "@/src/hepler";
import { useEffect, useState } from "react";

export const ShowProductPrice = ({ price }: { price: number }) => {
  // const formatNumberWithCommas
  const [itemPrice, setItemPrice] = useState(price);

  const [currency, setCurrency] = useState("INR");
  useEffect(() => {
    if (localStorage) {
      const localCurrency = localStorage.getItem("currency");
      setCurrency(localCurrency || "INR");
      setItemPrice(price);
    }
  }, []);

  if (!currency || currency === "INR") {
    return `INR ${formatNumberWithCommas(price)}`;
  }

  if (currency === "USD") {
    const value = price / DOLLAR_CONVERSION_VALUE;
    return <> USD {value.toFixed(2)}</>;
  }
};
