import React from "react";
import { Textarea as TextAreaShadcn } from "../ui/textarea";

export const Textarea = (
  props: React.ComponentProps<typeof TextAreaShadcn>
) => {
  return <Textarea {...props} />;
};
