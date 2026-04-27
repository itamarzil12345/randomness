import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  children: ReactNode;
};

export const Button = ({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps): JSX.Element => {
  const classes = ["button", `button-${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
