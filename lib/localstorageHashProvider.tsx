"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect } from "react";

interface LocalstorageHashProviderProps {
  children: React.ReactNode;
}

const LocalstorageHashProvider: React.FC<LocalstorageHashProviderProps> = ({
  children,
}) => {
  const [hash, setHash] = useState<string | null>(null);
  const [inputHash, setInputHash] = useState<string>("");

  useEffect(() => {
    const storedHash = localStorage.getItem("hash");
    setHash(storedHash);
  }, []);

  const handleHashSubmit = () => {
    if (inputHash === "123321") {
      localStorage.setItem("hash", "123321");
      setHash("123321");
    } else {
      alert("Invalid hash");
    }
  };

  if (hash === "123321") {
    return <>{children}</>;
  }

  return (
    <div className=" flex gap-4 w-96 p-12 mx-auto items-center justify-center">
      <Input
        type="text"
        value={inputHash}
        onChange={(e) => setInputHash(e.target.value)}
        placeholder="Enter hash"
      />
      <Button onClick={handleHashSubmit}>Submit</Button>
    </div>
  );
};

export default LocalstorageHashProvider;
