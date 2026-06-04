import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#20201f]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border border-[#e5e2db] bg-[#f7f6f2] px-4 py-2.5 text-sm text-[#20201f] placeholder:text-[#20201f]/70 transition focus:outline-none focus:ring-2 focus:ring-[#20201f]/20 focus:border-[#20201f]/40",
            error && "border-red-400 focus:ring-red-400/30",
            className
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-[#20201f]/65">{hint}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
