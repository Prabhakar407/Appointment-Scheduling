import { forwardRef } from "react";

const variants = {
  default: "",
  ghost: "bg-transparent",
  outline: "border",
};

const sizes = {
  default: "px-4 py-2",
  icon: "h-10 w-10 p-0",
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const Button = forwardRef(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
