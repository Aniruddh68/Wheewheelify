# Design System Strategy: High-Performance Automotive Editorial

## 1. Overview & Creative North Star: "The Kinetic Monolith"
This design system is engineered to evoke the raw power and precision of high-end automotive engineering. Our Creative North Star is **"The Kinetic Monolith"**—an aesthetic defined by deep atmospheric shadows, high-contrast illumination, and an aggressive, ultra-modern layout.

We move beyond the "standard SaaS grid" by embracing **intentional asymmetry** and **volumetric depth**. Imagine a supercar in a dark showroom: you don't see the whole car at once; you see the highlights on the curves. Our UI follows this principle—using light sparingly to guide the eye, while letting the "OLED Black" canvas provide a sense of infinite scale.

- **Dramatic Lighting:** Use radial gradients and noise to simulate a physical environment.
- **Editorial Impact:** Headlines are treated as architectural elements, using ultra-bold condensed typography to command attention.
- **Atmospheric Depth:** Components are not "placed" on a grid; they are layered within a volumetric space using glassmorphism and subtle red glows.

---

## 2. Colors: High-Contrast Obsidian & Crimson
The palette is restricted to a high-tension triad: Deep Black, Pulse Red, and Stark White.

| Token | Hex | Role |
| :--- | :--- | :--- |
| `surface` | `#0A0A0A` | The OLED base. Everything emerges from this darkness. |
| `primary` | `#FF1A1A` | The Pulse Red. Used for critical CTAs and high-energy accents. |
| `on-surface` | `#E5E2E1` | Off-white for readability; reduces harsh glare on OLED. |
| `surface-container-high` | `#2A2A2A` | For elevated glass layers. |
| `outline-variant` | `#5F3E3A` | Low-visibility "ghost" lines for structural necessity. |

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Layout boundaries must be defined through:
1. **Background Shifts:** Moving from `surface` to `surface-container-low`.
2. **Atmospheric Gradients:** A subtle `primary` radial gradient (at 5-10% opacity) behind a car image to define its hit-area.
3. **Negative Space:** Use the `20` (7rem) spacing token to create hard breaks between content blocks.

### Signature Textures & Gradients
- **The Engine Grain:** Apply a 5% opacity fine-grain noise texture as a global overlay to the `surface`. This breaks the digital "flatness" and adds a premium, cinematic feel.
- **Volumetric Glow:** Use a `primary_container` (#FF5545) radial gradient behind hero assets to simulate "underglow" lighting.

---

## 3. Typography: The Power of the Condensed
Typography is our primary tool for expressing "speed." We pair high-impact, condensed displays with airy, light-weight body text.

- **Display & Headlines (`inter`, Ultra-Bold Condensed):** These must feel heavy and mechanical. Use `display-lg` (3.5rem) for vehicle names, often using negative letter-spacing (-0.05em) to increase the "monolithic" feel.
- **Body (`inter`, Light):** Used at `body-md` (0.875rem). Set with generous line height (1.6) to provide a sophisticated, editorial contrast to the aggressive headlines.
- **Labels (`inter`, Bold, All-Caps):** Small technical data points should be all-caps with increased letter-spacing (+0.1em) to mimic a racing dashboard.

---

## 4. Elevation & Depth: Tonal Layering
In this system, depth is not achieved with drop shadows, but through **Tonal Layering** and **Refraction**.

- **The Layering Principle:** 
    - Base: `surface` (#0A0A0A).
    - Section Highlight: `surface-container-lowest` (#0E0E0E).
    - Interactive Element: `surface-container-high` (#2A2A2A) with a 20px `backdrop-blur`.
- **The "Ghost Border" Fallback:** If a container (like a comparison card) requires a border, use the `outline-variant` token at **20% opacity**. This creates a "barely-there" edge that catches the light like the edge of a glass pane.
- **Ambient Shadows:** For floating modals, use a shadow with a 60px blur, 10% opacity, using the `primary` red color. This simulates a red ambient light reflecting off the surface below.

---

## 5. Components: Precision Engineered

### Buttons
- **Primary (Pill):** Solid `primary` red. Apply a subtle `0 0 15px` outer glow using the same hex. Use `full` roundedness. Text is `on_primary` (White).
- **Secondary (Ghost):** `outline` (#B08781) at 30% opacity with white text. On hover, the border becomes 100% opaque `primary`.

### Glassmorphism Data Chips
- **Style:** Used for vehicle specs (e.g., 0-60mph).
- **Construction:** `surface-container-high` at 40% opacity, `backdrop-blur: 12px`, and a top-weighted 1px border using `primary` at 20% opacity to simulate a "rim light."

### Input Fields
- **Style:** Forbid the "box" look. Use a `surface-container-low` background with a `none` border, and a 2px `primary` bottom-border that illuminates only when focused.

### Comparison Cards
- **Construction:** No dividers. Use `spacing-6` (2rem) to separate internal data. Use a `surface-container-highest` background for the "Winner" of a comparison to make it physically pop forward.

### Sticky Navigation
- **Style:** Use `surface` at 70% opacity with a heavy `20px` backdrop-blur. The bottom edge should have a 1px "Ghost Border" at 10% opacity.

---

## 6. Do's and Don'ts

### Do:
- **Use Large Imagery:** Car assets should bleed off the edge of the screen or overlap between `surface` and `surface-container` tiers.
- **Embrace the Dark:** Keep 80% of the screen in the `surface` or `surface-container-lowest` range.
- **Use "Red Glows" for Focus:** Use subtle red radial gradients to highlight the most important vehicle in a comparison list.

### Don't:
- **No Purple:** Avoid any cool-toned purples or magentas. If you need a secondary color, use a desaturated `secondary-container` grey.
- **No Standard Borders:** Never use a solid 100% opaque border to separate the header from the body. Use a background color shift.
- **No Text Gradients:** Text must remain solid `on-surface` or `primary`. Gradient text diminishes the "monolithic" impact of the condensed typography.
- **No Sharp Shadows:** If a shadow is visible, it's too dark. It should feel like a "mood," not a "drop."