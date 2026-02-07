import React, { useState, useRef, useEffect } from "react";
import { cn } from "../lib/utils";

export interface DropdownOption<T extends string = string> {
    value: T;
    label: React.ReactNode;
}

export interface DropdownProps<T extends string = string> {
    /** The currently selected value */
    value: T;
    /** Available options */
    options: DropdownOption<T>[];
    /** Called when a new option is selected */
    onChange?: (value: T) => void;
    /** Custom trigger element — receives the selected option. Falls back to rendering the selected label in a button. */
    trigger?: (selected: DropdownOption<T>) => React.ReactNode;
    /** Additional class name for the wrapper */
    className?: string;
    /** Additional class name for the dropdown menu */
    menuClassName?: string;
    /** Alignment of the dropdown menu */
    align?: "left" | "right";
    /** Disable the dropdown */
    disabled?: boolean;
}

export function Dropdown<T extends string = string>({
    value,
    options,
    onChange,
    trigger,
    className,
    menuClassName,
    align = "left",
    disabled = false,
}: DropdownProps<T>) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value) ?? options[0];

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open]);

    return (
        <div ref={wrapperRef} className={cn("relative inline-block", className)}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                className={cn(
                    "cursor-pointer",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
                disabled={disabled}
            >
                {trigger ? trigger(selected) : (
                    <span className="text-sm text-text-primary">{selected?.label}</span>
                )}
            </button>

            {/* Menu */}
            {open && (
                <div
                    className={cn(
                        "absolute z-30 top-full mt-1 bg-bg-card border border-border-default rounded-lg shadow-xl overflow-hidden min-w-[160px]",
                        align === "right" ? "right-0" : "left-0",
                        menuClassName
                    )}
                >
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange?.(option.value);
                                setOpen(false);
                            }}
                            className={cn(
                                "flex items-center w-full px-3 py-2 hover:bg-bg-elevated/60 transition-colors cursor-pointer",
                                option.value === value && "bg-bg-elevated/40"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

Dropdown.displayName = "Dropdown";
