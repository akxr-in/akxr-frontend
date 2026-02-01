import React from "react";
import { cn } from "../lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  size?: "sm" | "md" | "lg";
  rightIcon?: React.ReactNode;
}

const sizeStyles = {
  sm: "h-10 text-sm",
  md: "h-12 text-base",
  lg: "h-14 text-lg",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, size = "md", rightIcon, className, id, ...props },
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
        <div
          className={cn(
            "flex items-center w-full rounded-md border bg-bg-primary transition-all duration-150",
            "focus-within:border-border-focus focus-within:ring-1 focus-within:ring-border-focus",
            sizeStyles[size],
            hasError
              ? "border-error focus-within:border-error focus-within:ring-error"
              : "border-border-default"
          )}
        >
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex-1 h-full bg-transparent text-text-primary outline-none px-4",
              "placeholder:text-text-muted",
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          {rightIcon && (
            <span className="flex items-center justify-center pr-4 text-text-muted">
              {rightIcon}
            </span>
          )}
        </div>
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
