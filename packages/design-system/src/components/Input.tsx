import React, { useState } from "react";
import { cn } from "../lib/utils";
import { EyeIcon, EyeOffIcon } from "../icons";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  size?: "sm" | "md" | "lg";
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const sizeStyles = {
  sm: "h-10 text-sm",
  md: "h-12 text-base",
  lg: "h-14 text-lg",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, size = "md", rightIcon, className, id, type, showPasswordToggle, ...props },
    ref
  ) => {
    const inputId = id || `input-${React.useId()}`;
    const hasError = Boolean(error);
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = useState(false);

    // Determine the actual input type
    const inputType = isPassword && showPasswordToggle && showPassword ? "text" : type;

    const handleTogglePassword = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setShowPassword(!showPassword);
    };

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
            type={inputType}
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
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={handleTogglePassword}
              className="flex items-center justify-center pr-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon size={18} />
              ) : (
                <EyeIcon size={18} />
              )}
            </button>
          )}
          {rightIcon && !(isPassword && showPasswordToggle) && (
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
