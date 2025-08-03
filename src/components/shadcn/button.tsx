import React from "react";
import { Button as ButtonShadcn } from "../ui/button";

export const Button = (props: React.ComponentProps<typeof ButtonShadcn>) => {
  return <ButtonShadcn {...props} />;
};
