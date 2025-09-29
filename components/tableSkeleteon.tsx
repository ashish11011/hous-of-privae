import React from "react";
import { Skeleton } from "./ui/skeleton";

const TableSkeleteon = () => {
  return (
    <div className=" flex p-4 flex-col gap-2 w-full">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
};

export default TableSkeleteon;
