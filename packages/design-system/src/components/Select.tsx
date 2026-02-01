import React from "react";
import { cn } from "../lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "h-10 text-sm px-4",
  md: "h-12 text-base px-4",
  lg: "h-14 text-lg px-5",
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, options, placeholder, size = "md", className, id, ...props },
    ref
  ) => {
    const selectId = id || `select-${React.useId()}`;
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full rounded-md border bg-bg-primary text-text-primary outline-none transition-all duration-150 appearance-none cursor-pointer pr-10",
              "focus:border-border-focus focus:ring-1 focus:ring-border-focus",
              sizeStyles[size],
              hasError
                ? "border-error focus:border-error focus:ring-error"
                : "border-border-default",
              !props.value && "text-text-muted",
              className
            )}
            aria-invalid={hasError}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-text-muted">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} className="text-text-primary bg-bg-primary">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {error && (
          <span className="text-sm text-error">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
