import React from "react";
import { cn } from "../lib/utils";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
    onRemove?: () => void;
    children: React.ReactNode;
}

export const Tag = React.forwardRef<HTMLSpanElement, TagProps>(
    ({ onRemove, children, className, ...props }, ref) => {
        return (
            <span
                ref={ref}
                className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-default bg-bg-primary text-text-secondary text-sm w-fit",
                    className
                )}
                {...props}
            >
                {children}
                {onRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="flex items-center justify-center w-4 h-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                        aria-label="Remove"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            className="w-3.5 h-3.5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </span>
        );
    }
);

Tag.displayName = "Tag";
