import React from "react";
import { cn } from "../lib/utils";

export interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeStyles = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-b-2",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
    return (
        <div
            className={cn(
                "animate-spin rounded-full border-brand border-t-transparent",
                sizeStyles[size],
                className
            )}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}
