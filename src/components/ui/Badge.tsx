import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "green" | "yellow" | "red" | "gray";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-[#eeece3] text-[#20201f]": variant === "default",
          "bg-emerald-100 text-emerald-700": variant === "green",
          "bg-amber-100 text-amber-700": variant === "yellow",
          "bg-red-100 text-red-700": variant === "red",
          "bg-[#e5e2db] text-[#20201f]/75": variant === "gray",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
