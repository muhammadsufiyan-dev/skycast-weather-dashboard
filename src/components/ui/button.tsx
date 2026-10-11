import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "ghost" };

export function Button({ variant = "default", className = "", type = "button", ...props }: ButtonProps) {
  const appearance = variant === "ghost" ? "hover:bg-secondary" : "bg-primary text-primary-foreground hover:bg-primary/90";
  return <button type={type} className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${appearance} ${className}`} {...props} />;
}
