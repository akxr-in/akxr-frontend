import React from "react";
import { cn } from "../lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "h-10 text-sm px-4",
  md: "h-12 text-base px-4",
  lg: "h-14 text-lg px-5",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, size = "md", className, id, ...props },
    ref
  ) => {
    const inputId = id || `input-${React.useId()}`;
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-md border bg-bg-primary text-text-primary outline-none transition-all duration-150",
            "placeholder:text-text-muted",
            "focus:border-border-focus focus:ring-1 focus:ring-border-focus",
            sizeStyles[size],
            hasError
              ? "border-error focus:border-error focus:ring-error"
              : "border-border-default",
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="text-sm text-error">
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={`${inputId}-hint`} className="text-sm text-text-muted">
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
