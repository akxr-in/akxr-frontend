import React, { useState, useRef } from "react";
import { cn } from "../lib/utils";
import { Tag } from "./Tag";

export interface MultiSelectOption {
    value: string;
    label: string;
}

export interface MultiSelectProps {
    /** Label shown above the input */
    label?: string;
    /** Placeholder text for the search input */
    placeholder?: string;
    /** The list of available options to choose from */
    options: MultiSelectOption[];
    /** Currently selected values */
    value: string[];
    /** Called when selections change */
    onChange: (value: string[]) => void;
    /** Error message to display */
    error?: string;
    /** Whether the user can add custom values not in the options list */
    allowCustom?: boolean;
    /** Custom label for the "Add custom" option. Defaults to 'Add "{search}"' */
    customLabel?: (search: string) => string;
    /** Optional size variant */
    size?: "sm" | "md" | "lg";
    /** Optional additional class names for the wrapper */
    className?: string;
}

const sizeStyles = {
    sm: "h-10 text-sm",
    md: "h-12 text-base",
    lg: "h-14 text-lg",
};

export const MultiSelect: React.FC<MultiSelectProps> = ({
    label,
    placeholder = "Search and select...",
    options,
    value,
    onChange,
    error,
    allowCustom = false,
    customLabel,
    size = "md",
    className,
}) => {
    const [search, setSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = options.filter(
        (opt) =>
            opt.label.toLowerCase().includes(search.toLowerCase()) &&
            !value.includes(opt.value)
    );

    const trimmedSearch = search.trim();
    const isCustom =
        allowCustom &&
        trimmedSearch.length > 0 &&
        !options.some(
            (opt) => opt.label.toLowerCase() === trimmedSearch.toLowerCase()
        ) &&
        !value.includes(trimmedSearch);

    const addItem = (itemValue: string) => {
        if (itemValue && !value.includes(itemValue)) {
            onChange([...value, itemValue]);
        }
        setSearch("");
        setShowDropdown(false);
    };

    const removeItem = (itemValue: string) => {
        onChange(value.filter((v) => v !== itemValue));
    };

    const getLabel = (itemValue: string) => {
        return (
            options.find((opt) => opt.value === itemValue)?.label || itemValue
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (isCustom) {
                addItem(trimmedSearch);
            } else if (filteredOptions.length > 0) {
                addItem(filteredOptions[0].value);
            }
        }
    };

    const hasError = Boolean(error);
    const hasDropdownItems = filteredOptions.length > 0 || isCustom;

    return (
        <div className={cn("flex flex-col gap-2 w-full", className)}>
            {label && (
                <label className="text-sm font-medium text-text-primary">
                    {label}
                </label>
            )}

            <div className="relative">
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
                        ref={inputRef}
                        type="text"
                        placeholder={placeholder}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() =>
                            setTimeout(() => setShowDropdown(false), 200)
                        }
                        onKeyDown={handleKeyDown}
                        className="flex-1 h-full bg-transparent text-text-primary outline-none px-4 placeholder:text-text-muted"
                    />
                </div>

                {showDropdown && hasDropdownItems && (
                    <div className="absolute z-10 w-full mt-1 bg-bg-secondary border border-border-default rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {isCustom && (
                            <button
                                type="button"
                                onClick={() => addItem(trimmedSearch)}
                                className="w-full text-left px-4 py-2 text-brand hover:bg-bg-elevated transition-colors cursor-pointer flex items-center gap-2"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                {customLabel
                                    ? customLabel(trimmedSearch)
                                    : `Add "${trimmedSearch}"`}
                            </button>
                        )}
                        {filteredOptions.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => addItem(opt.value)}
                                className="w-full text-left px-4 py-2 text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((v) => (
                        <Tag key={v} onRemove={() => removeItem(v)}>
                            {getLabel(v)}
                        </Tag>
                    ))}
                </div>
            )}

            {error && (
                <span className="text-sm text-error">{error}</span>
            )}
        </div>
    );
};

MultiSelect.displayName = "MultiSelect";
