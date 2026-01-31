"use client";

import { Button } from "@akxr/design-system";

// Simple icon component matching the Figma
const BrandIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
);

export default function DesignSystemShowcase() {
    return (
        <main className="min-h-screen bg-bg-primary text-text-primary p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-12">
                    <h1 className="text-3xl font-bold mb-2">AKXR Design System</h1>
                    <p className="text-text-secondary">
                        Component library for building consistent UIs
                    </p>
                </header>

                {/* Button Section */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border-default">
                        Button
                    </h2>

                    {/* All 4 Variants */}
                    <div className="mb-8">
                        <h3 className="text-sm font-medium text-text-secondary mb-4">
                            Variants
                        </h3>
                        <div className="flex flex-col gap-4 max-w-xs">
                            <Button variant="primary" leftIcon={<BrandIcon />}>
                                Join now
                            </Button>
                            <Button variant="secondary" leftIcon={<BrandIcon />}>
                                Join now
                            </Button>
                            <Button variant="outline" leftIcon={<BrandIcon />}>
                                Join now
                            </Button>
                            <Button variant="ghost" leftIcon={<BrandIcon />}>
                                Join now
                            </Button>
                        </div>
                    </div>

                    {/* Sizes */}
                    <div className="mb-8">
                        <h3 className="text-sm font-medium text-text-secondary mb-4">
                            Sizes
                        </h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button size="sm" leftIcon={<BrandIcon />}>
                                Small
                            </Button>
                            <Button size="md" leftIcon={<BrandIcon />}>
                                Medium
                            </Button>
                            <Button size="lg" leftIcon={<BrandIcon />}>
                                Large
                            </Button>
                        </div>
                    </div>

                    {/* States */}
                    <div className="mb-8">
                        <h3 className="text-sm font-medium text-text-secondary mb-4">
                            States
                        </h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button leftIcon={<BrandIcon />}>Default</Button>
                            <Button disabled leftIcon={<BrandIcon />}>
                                Disabled
                            </Button>
                            <Button isLoading>Loading</Button>
                        </div>
                    </div>

                    {/* Without Icon */}
                    <div>
                        <h3 className="text-sm font-medium text-text-secondary mb-4">
                            Without Icon
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="primary">Join now</Button>
                            <Button variant="secondary">Join now</Button>
                            <Button variant="outline">Join now</Button>
                            <Button variant="ghost">Join now</Button>
                        </div>
                    </div>
                </section>

                {/* Colors Section */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-border-default">
                        Colors
                    </h2>

                    {/* Brand */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-text-secondary mb-3">
                            Brand (Gold)
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                            <div className="bg-brand text-text-inverted p-4 rounded-lg text-center text-sm">
                                brand
                            </div>
                            <div className="bg-brand-hover text-text-inverted p-4 rounded-lg text-center text-sm">
                                brand-hover
                            </div>
                            <div className="bg-brand-muted text-text-primary p-4 rounded-lg text-center text-sm">
                                brand-muted
                            </div>
                            <div className="bg-brand-subtle text-text-primary p-4 rounded-lg text-center text-sm">
                                brand-subtle
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-text-secondary mb-3">
                            Status
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                            <div className="bg-success text-white p-4 rounded-lg text-center text-sm">
                                success
                            </div>
                            <div className="bg-error text-white p-4 rounded-lg text-center text-sm">
                                error
                            </div>
                            <div className="bg-warning text-text-inverted p-4 rounded-lg text-center text-sm">
                                warning
                            </div>
                            <div className="bg-info text-white p-4 rounded-lg text-center text-sm">
                                info
                            </div>
                        </div>
                    </div>

                    {/* Backgrounds */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-text-secondary mb-3">
                            Backgrounds
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                            <div className="bg-bg-deep border border-border-default text-text-primary p-4 rounded-lg text-center text-sm">
                                bg-deep
                            </div>
                            <div className="bg-bg-primary border border-border-default text-text-primary p-4 rounded-lg text-center text-sm">
                                bg-primary
                            </div>
                            <div className="bg-bg-secondary border border-border-default text-text-primary p-4 rounded-lg text-center text-sm">
                                bg-secondary
                            </div>
                            <div className="bg-bg-elevated border border-border-default text-text-primary p-4 rounded-lg text-center text-sm">
                                bg-elevated
                            </div>
                        </div>
                    </div>

                    {/* Text */}
                    <div>
                        <h3 className="text-sm font-medium text-text-secondary mb-3">
                            Text
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                            <div className="bg-bg-elevated p-4 rounded-lg text-center">
                                <span className="text-text-primary text-sm">text-primary</span>
                            </div>
                            <div className="bg-bg-elevated p-4 rounded-lg text-center">
                                <span className="text-text-secondary text-sm">
                                    text-secondary
                                </span>
                            </div>
                            <div className="bg-bg-elevated p-4 rounded-lg text-center">
                                <span className="text-text-muted text-sm">text-muted</span>
                            </div>
                            <div className="bg-brand p-4 rounded-lg text-center">
                                <span className="text-text-inverted text-sm">text-inverted</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="pt-8 border-t border-border-default text-center text-sm text-text-muted">
                    <p>AKXR Design System</p>
                </footer>
            </div>
        </main>
    );
}
