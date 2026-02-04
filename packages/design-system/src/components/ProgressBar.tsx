import React from "react";
import { cn } from "../lib/utils";

export interface ProgressBarProps
    extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    variant?: "brand" | "success";
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    variant = "brand",
    className,
    ...props
}) => {
    const clamped = Math.min(100, Math.max(0, value));
    const bgColor = variant === "success" ? "bg-success" : "bg-brand";

    return (
        <div
            className={cn(
                "h-4 bg-bg-elevated rounded-full overflow-hidden",
                className
            )}
            {...props}
        >
            <div
                className={cn(
                    "h-full rounded-full transition-all duration-300",
                    bgColor
                )}
                style={{ width: `${clamped}%` }}
            />
        </div>
    );
};

