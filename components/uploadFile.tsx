import { uploadFileToS3 } from "@/lib/s3-upload";
import { Plus } from "lucide-react";
import React, { useRef } from "react";

const UploadFile = ({ onChange }: any) => {
  const ref = useRef<any>();

  const handleFileUploadClick = () => {
    ref.current?.click();
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    const fileS3URL = await uploadFileToS3(file, "products");
    onChange(fileS3URL);
  };

  return (
    <div
      onClick={handleFileUploadClick}
      className=" p-6 w-fit h-fit border-dashed border-2 hover:bg-gray-50 cursor-pointer rounded-md"
    >
      <Plus />
      <input
        onChange={handleImageUpload}
        accept="image/*"
        multiple={false}
        className=" hidden"
        type="file"
        ref={ref}
      />
    </div>
  );
};

export default UploadFile;
