"use client";
import React from "react";
import { Label } from "./shadcn";
import { useField } from "formik";
import { Input } from "./ui/input";

interface LabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  labelName: string;
}

export const LabelInput = ({ labelName, ...props }: LabelInputProps) => {
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
