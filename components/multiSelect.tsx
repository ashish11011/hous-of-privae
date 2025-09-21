import * as React from "react";
import { useField, useFormikContext } from "formik";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils"; // Your class merge util
import { Label } from "./ui/label";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  labelName: string;
  name: string;
  options: Option[];
  placeholder?: string;
}

const MultiSelect = ({
  labelName,
  name,
  options,
  placeholder = "Select options",
}: MultiSelectProps) => {
  const [field, , helpers] = useField<string[]>({ name });
  const { setFieldValue } = useFormikContext();
  const [open, setOpen] = React.useState(false);

  const selectedValues = field.value || [];

  const toggleOption = (value: string) => {
    const newValue = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];

    setFieldValue(name, newValue);
  };

  const displayText =
    selectedValues.length === 0
      ? placeholder
      : `${selectedValues.length} selected`;

  return (
    <div className="space-y-1">
      <Label>{labelName}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between",
              selectedValues.length === 0 && "text-muted-foreground"
            )}
          >
            {displayText}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-full  p-2 max-h-60 overflow-auto"
        >
          <div className="flex flex-col space-y-1">
            {options.map((option) => {
              const selected = selectedValues.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    "flex items-center space-x-2 cursor-pointer rounded-md px-2 py-1 hover:bg-accent",
                    selected && "bg-accent"
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{option.label}</span>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MultiSelect;
