"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#20201f]/30 disabled:opacity-40 disabled:pointer-events-none font-outfit tracking-wide",
          {
            "bg-[#20201f] text-[#f7f6f2] hover:bg-[#3a3a38] rounded-full": variant === "primary",
            "bg-[#eeece3] text-[#20201f] hover:bg-[#e5e2db] rounded-full": variant === "secondary",
            "border border-[#20201f] text-[#20201f] hover:bg-[#20201f] hover:text-[#f7f6f2] rounded-full": variant === "outline",
            "text-[#20201f] hover:bg-[#eeece3] rounded-full": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700 rounded-full": variant === "danger",
          },
          {
            "px-4 py-1.5 text-xs gap-1.5": size === "sm",
            "px-6 py-2.5 text-sm gap-2": size === "md",
            "px-8 py-3.5 text-sm gap-2": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
