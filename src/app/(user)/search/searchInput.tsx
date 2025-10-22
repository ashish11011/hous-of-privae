"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const SearchInput = ({ defValue }: { defValue?: string }) => {
  const [search, setSearch] = useState<string>(defValue as string);
  const router = useRouter();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim()) {
        router.push(`/search?search=${encodeURIComponent(search)}`);
      }
    }, 500); // debounce time: 500ms

    return () => clearTimeout(delayDebounce); // cleanup on each keystroke
  }, [search, router]);

  return (
    <div className=" p-4 flex gap-4 items-center">
      <Input
        placeholder="Search for any product"
        className=" rounded-sm h-10 sm:h-12"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Search
        onClick={() => setSearch("")}
        className=" cursor-pointer"
        size={20}
      />
    </div>
  );
};

export default SearchInput;
