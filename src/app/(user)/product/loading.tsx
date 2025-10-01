import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const loading = () => {
  return (
    <div className=" h-96 my-12 w-[80%] mx-auto flex gap-12 items-center justify-center flex-col md:flex-row">
      <Skeleton className="h-96 w-[250px]" />
      <Skeleton className="h-96 w-[250px]" />
    </div>
  );
};

export default loading;
