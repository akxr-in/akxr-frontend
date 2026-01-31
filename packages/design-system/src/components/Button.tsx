import React from "react";
import { cn } from "../lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    children: React.ReactNode;
}

const variantStyles = {
    primary:
        "bg-primary text-primary-foreground border-primary hover:opacity-90",
    secondary:
        "bg-secondary text-secondary-foreground border-secondary hover:opacity-80",
    outline: "bg-transparent text-foreground border-border hover:bg-muted",
    ghost: "bg-transparent text-foreground border-transparent hover:bg-muted",
};

const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-[0.9375rem]",
    lg: "px-6 py-3 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "md",
            isLoading = false,
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
                    "inline-flex items-center justify-center gap-2 font-medium rounded-md border cursor-pointer transition-all duration-150 relative",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    variantStyles[variant],
                    sizeStyles[size],
                    isLoading && "pointer-events-none",
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <span
                        className="absolute w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin"
                        aria-hidden="true"
                    />
                )}
                <span className={isLoading ? "invisible" : ""}>{children}</span>
            </button>
        );
    }
);

Button.displayName = "Button";
