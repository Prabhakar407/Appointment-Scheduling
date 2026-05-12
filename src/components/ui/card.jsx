import { forwardRef } from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const Card = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border", className)} {...props} />
));

Card.displayName = "Card";

export const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
));

CardContent.displayName = "CardContent";
