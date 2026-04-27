import MuiButton, { type ButtonProps as MuiButtonProps } from "@mui/material/Button";
import type { ReactNode } from "react";

type ButtonProps = Omit<MuiButtonProps, "variant" | "color"> & {
  variant?: "primary" | "secondary" | "danger";
  children: ReactNode;
};

export const Button = ({
  variant = "primary",
  children,
  ...props
}: ButtonProps): JSX.Element => {
  const color = variant === "danger" ? "error" : "primary";
  const muiVariant = variant === "primary" ? "contained" : "outlined";

  return (
    <MuiButton color={color} variant={muiVariant} {...props}>
      {children}
    </MuiButton>
  );
};
