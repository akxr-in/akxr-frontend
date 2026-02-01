import React from "react";
import { cn } from "../lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    children: React.ReactNode;
}

const variantStyles = {
    // Gold solid button, dark text
    primary:
        "bg-brand text-text-inverted border-brand hover:bg-brand-hover hover:border-brand-hover",
    // Brown solid button, gold text
    secondary:
        "bg-brand-muted text-primary border-brand-muted hover:bg-brand-subtle hover:border-brand-subtle",
    // Transparent with gold border, gold text
    outline:
        "bg-transparent text-primary border-brand hover:bg-brand-subtle",
    // Dark with muted gold border, muted text
    ghost:
        "bg-transparent text-text-muted border-border-default hover:border-brand-hover hover:text-text-secondary",
};

const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "md",
            isLoading = false,
            leftIcon,
            children,
            className,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center gap-2 font-medium rounded-md border cursor-pointer transition-all duration-150 relative w-fit",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    variantStyles[variant],
                    sizeStyles[size],
                    isLoading && "pointer-events-none",
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <span
                        className="w-5 h-5 border border-current border-r-transparent rounded-full animate-spin"
                        aria-hidden="true"
                    />
                ) : leftIcon ? (
                    <span className="w-5 h-5 flex items-center justify-center">
                        {leftIcon}
                    </span>
                ) : null}
                <span>{children}</span>
            </button>
        );
    }
);

Button.displayName = "Button";
