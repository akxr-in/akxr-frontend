"use client";

import { Button, Input } from "@akxr/design-system";
import { useState } from "react";

export default function DesignSystemShowcase() {
    const [inputValue, setInputValue] = useState("");

    return (
        <main className="min-h-screen bg-background text-foreground p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-12">
                    <h1 className="text-3xl font-bold mb-2">AKXR Design System</h1>
                    <p className="text-muted-foreground">
                        Component library for building consistent UIs
                    </p>
                </header>

                {/* Button Section */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border">
                        Button
                    </h2>

                    {/* Variants */}
                    <div className="mb-8">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">
                            Variants
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="primary">Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                        </div>
                    </div>

                    {/* Sizes */}
                    <div className="mb-8">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">
                            Sizes
                        </h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button size="sm">Small</Button>
                            <Button size="md">Medium</Button>
                            <Button size="lg">Large</Button>
                        </div>
                    </div>

                    {/* States */}
                    <div className="mb-8">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">
                            States
                        </h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button>Default</Button>
                            <Button disabled>Disabled</Button>
                            <Button isLoading>Loading</Button>
                        </div>
                    </div>

                    {/* All Variants + Sizes */}
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">
                            All Combinations
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 pr-4 font-medium">Variant</th>
                                        <th className="text-left py-3 px-4 font-medium">Small</th>
                                        <th className="text-left py-3 px-4 font-medium">Medium</th>
                                        <th className="text-left py-3 px-4 font-medium">Large</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(["primary", "secondary", "outline", "ghost"] as const).map(
                                        (variant) => (
                                            <tr key={variant} className="border-b border-border">
                                                <td className="py-4 pr-4 capitalize">{variant}</td>
                                                <td className="py-4 px-4">
                                                    <Button variant={variant} size="sm">
                                                        Button
                                                    </Button>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Button variant={variant} size="md">
                                                        Button
                                                    </Button>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Button variant={variant} size="lg">
                                                        Button
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Input Section */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border">
                        Input
                    </h2>

                    {/* Basic */}
                    <div className="mb-8 max-w-md">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">
                            Basic
                        </h3>
                        <Input placeholder="Enter text..." />
                    </div>

                    {/* With Label */}
                    <div className="mb-8 max-w-md">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">
                            With Label
                        </h3>
                        <Input label="Email" placeholder="you@example.com" />
                    </div>

                    {/* With Hint */}
                    <div className="mb-8 max-w-md">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">
                            With Hint
                        </h3>
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Enter password"
                            hint="Must be at least 8 characters"
                        />
                    </div>

                    {/* With Error */}
                    <div className="mb-8 max-w-md">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">
                            With Error
                        </h3>
                        <Input
                            label="Username"
                            placeholder="Enter username"
                            error="This username is already taken"
                        />
                    </div>

                    {/* Sizes */}
                    <div className="mb-8 max-w-md">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">
                            Sizes
                        </h3>
                        <div className="flex flex-col gap-4">
                            <Input size="sm" placeholder="Small input" />
                            <Input size="md" placeholder="Medium input" />
                            <Input size="lg" placeholder="Large input" />
                        </div>
                    </div>

                    {/* With Icons */}
                    <div className="mb-8 max-w-md">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">
                            With Icons
                        </h3>
                        <div className="flex flex-col gap-4">
                            <Input
                                label="Search"
                                placeholder="Search..."
                                leftIcon={
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
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                }
                            />
                            <Input
                                label="Website"
                                placeholder="example.com"
                                leftIcon={
                                    <span className="text-xs font-medium">https://</span>
                                }
                                rightIcon={
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
                                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                        />
                                    </svg>
                                }
                            />
                        </div>
                    </div>

                    {/* Interactive */}
                    <div className="max-w-md">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">
                            Interactive Demo
                        </h3>
                        <div className="p-6 border border-border rounded-lg bg-muted/30">
                            <Input
                                label="Try typing"
                                placeholder="Type something..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                hint={
                                    inputValue
                                        ? `You typed: "${inputValue}"`
                                        : "Start typing to see changes"
                                }
                            />
                        </div>
                    </div>
                </section>

                {/* Colors Section */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border">
                        Theme Colors
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: "Primary", bg: "bg-primary", text: "text-primary-foreground" },
                            { name: "Secondary", bg: "bg-secondary", text: "text-secondary-foreground" },
                            { name: "Accent", bg: "bg-accent", text: "text-accent-foreground" },
                            { name: "Muted", bg: "bg-muted", text: "text-muted-foreground" },
                            { name: "Background", bg: "bg-background border border-border", text: "text-foreground" },
                            { name: "Error", bg: "bg-error", text: "text-white" },
                            { name: "Success", bg: "bg-success", text: "text-white" },
                            { name: "Warning", bg: "bg-warning", text: "text-foreground" },
                        ].map((color) => (
                            <div
                                key={color.name}
                                className={`${color.bg} ${color.text} p-4 rounded-lg text-center font-medium`}
                            >
                                {color.name}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
                    <p>AKXR Design System • Built with Tailwind CSS</p>
                </footer>
            </div>
        </main>
    );
}
