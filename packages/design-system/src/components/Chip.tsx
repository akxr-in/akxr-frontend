import React from "react";
import { cn } from "../lib/utils";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "success" | "warning" | "error" | "info" | "neutral";
    children: React.ReactNode;
}

const variantStyles = {
    success: {
        container: "bg-success-subtle border-success-muted text-success",
        dot: "bg-success",
    },
    warning: {
        container: "bg-brand-subtle border-brand-muted text-brand",
        dot: "bg-brand",
    },
    error: {
        container: "bg-error-subtle border-error-muted text-error",
        dot: "bg-error",
    },
    info: {
        container: "bg-accent-subtle border-accent-muted text-accent-light",
        dot: "bg-accent-light",
    },
    neutral: {
        container: "bg-bg-secondary border-border-default text-text-muted",
        dot: "bg-text-muted",
    },
};

export const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
    ({ variant = "neutral", children, className, ...props }, ref) => {
        const styles = variantStyles[variant];

        return (
            <span
                ref={ref}
                className={cn(
                    "inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border text-sm font-medium w-fit",
                    styles.container,
                    className
                )}
                {...props}
            >
                <span
                    className={cn("w-2 h-2 rounded-full", styles.dot)}
                    aria-hidden="true"
                />
                {children}
            </span>
        );
    }
);

Chip.displayName = "Chip";
