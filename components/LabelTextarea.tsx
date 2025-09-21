"use client";
import React from "react";
import { useField } from "formik";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

interface LabelInputProps
  extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  labelName: string;
}

const LabelTextarea = ({ labelName, ...props }: LabelInputProps) => {
  const [field, meta] = useField(props.name!);
  return (
    <div className=" space-y-1 w-full">
      <Label>{labelName}</Label>
      <Textarea {...field} {...props} />
      {meta.touched && meta.error ? (
        <p className=" text-red-500 text-sm">{meta.error}</p>
      ) : (
        <></>
      )}
    </div>
  );
};

export default LabelTextarea;
