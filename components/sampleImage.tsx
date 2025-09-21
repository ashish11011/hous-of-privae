import Image from "next/image";
import React from "react";

const SampleImage = () => {
  return (
    <div className=" w-full h-full bg-[#D5D6CF]">
      <Image
        src={"/logo.jpeg"}
        alt={"image"}
        width={1200}
        height={1200}
        className="  h-full w-full object-contain"
      />
    </div>
  );
};

export default SampleImage;
