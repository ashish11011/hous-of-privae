"use client";

import React, { useEffect } from "react";
import Editor from "./editor";

const page = () => {
  const [data, setData] = React.useState("");
  useEffect(() => {
    console.log(data);
  }, [data]);
  return (
    <div>
      <Editor value={data} fieldChange={setData} />
    </div>
  );
};

export default page;
