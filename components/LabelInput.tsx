"use client";
import React from "react";
import { useField } from "formik";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface LabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  labelName?: string;
}

const LabelInput = ({ labelName, ...props }: LabelInputProps) => {
  const [field, meta] = useField(props.name!);
  return (
    <div className=" space-y-1 w-full">
      <Label>{labelName}</Label>
      <Input {...field} {...props} />
      {meta.touched && meta.error ? (
        <p className=" text-red-500 text-sm">{meta.error}</p>
      ) : (
        <></>
      )}
    </div>
  );
};

export default LabelInput;
