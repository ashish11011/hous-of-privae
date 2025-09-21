import React from "react";
import {
  Select as SelectShadcn,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useField, useFormikContext } from "formik";
import { Label } from "./ui/label";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  labelName: string;
  name: string;
  options: Option[];
  placeholder?: string;
}

export const Select = ({
  labelName,
  name,
  options,
  placeholder,
}: SelectProps) => {
  const [field, , helpers] = useField(name);
  const { setFieldValue } = useFormikContext();

  return (
    <div className=" space-y-1">
      <Label>{labelName}</Label>

      <SelectShadcn
        value={field.value || ""}
        onValueChange={(value) => setFieldValue(name, value)}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </SelectShadcn>
    </div>
  );
};
