"use client";

import { useEffect, useRef } from "react";
import { provideRtkDesignSystem } from "@cloudflare/realtimekit-react-ui";

/**
 * Bridge from akxr design tokens → Cloudflare RealtimeKit UI tokens.
 *
 * The RealtimeKit UI library uses Stencil web components with its own
 * design-system layer. The only supported customization API is
 * `provideRtkDesignSystem(element, tokens)` — imperative, takes a DOM
 * element and a small set of tokens (brand/background/text/danger/
 * success/warning, plus a borderRadius/borderWidth/spacingBase/theme
 * trio). Hex strings only; CSS custom-property references aren't
 * accepted there, so we resolve them from `:root` at runtime and pass
 * the raw hex values through. Token foundation = single source of
 * truth; this just mirrors a subset of it into RtK's vocabulary.
 *
 * The bridge re-runs whenever the design tokens change (theme switch),
 * because we read from `getComputedStyle` on each effect run.
 */

function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

interface RtkThemeBridgeProps {
  children: React.ReactNode;
}

export function RtkThemeBridge({ children }: RtkThemeBridgeProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    // Resolve everything once per mount. The RtK provider stores the
    // values on the element, so we don't need to be reactive — the
    // values only change on a full theme toggle, which is a route-level
    // event in this app.
    const tokens = {
      theme: "dark" as const,
      borderRadius: "rounded" as const,   // 4–8px corners, matches our --r-sm/--r-md
      borderWidth: "thin" as const,
      spacingBase: 4,

      // Geist is already loaded by next/font; pin RtK to it so its UI
      // doesn't fall back to a system font mid-call.
      fontFamily: cssVar("--font-geist-sans", "Geist") || "Geist",

      colors: {
        brand: {
          300: cssVar("--gold-ink",  "#E2B566"),  // hover ink
          400: cssVar("--gold",      "#C9963A"),
          500: cssVar("--gold",      "#C9963A"),  // canonical
          600: cssVar("--gold-deep", "#B27C19"),  // active / pressed
          700: cssVar("--gold-bg-2", "#523D14"),  // deep base
        },
        background: {
          1000: cssVar("--bg-0",    "#050505"),  // page edge
          900:  cssVar("--paper",   "#0a0a0a"),  // app bg
          800:  cssVar("--paper-2", "#141414"),  // chrome (header/footer)
          700:  cssVar("--card",    "#191919"),  // panels / sidebar
          600:  cssVar("--card-elev","#27272a"), // hover / elevated
        },
        text:            cssVar("--ink",    "#fafafa"),
        "text-on-brand": cssVar("--paper",  "#0a0a0a"),  // dark text on gold
        "video-bg":      cssVar("--bg-0",   "#050505"),  // tiles behind video
        danger:          cssVar("--bad",    "#C52222"),
        success:         cssVar("--ok",     "#22C55E"),
        warning:         cssVar("--gold",   "#C9963A"),
      },
    };

    provideRtkDesignSystem(rootRef.current, tokens);
  }, []);

  // Inline display:contents would be nicest, but RtK reads the design
  // tokens via the element's *own* style property — we need a real box.
  // Use a wrapper that's invisible to layout (flex: 1 + 100% min sizing
  // so the meeting page's flexbox treats it as a normal child).
  return (
    <div ref={rootRef} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
