# High-Performance Editorial: Design System Documentation

## 1. Overview & Creative North Star: "The Kinetic Gallery"
The North Star for this design system is **"The Kinetic Gallery."** We are moving away from the "catalog" feel of traditional automotive sites and toward a high-end editorial experience. The goal is to capture the sensation of speed and precision through whitespace and typography rather than heavy textures or dark backgrounds.

To break the "template" look, we utilize **Intentional Asymmetry**. Instead of centered grids, we use heavy left-aligned headlines that "hang" over oversized imagery, and pill-shaped containers that overlap section boundaries. This creates a sense of motion, as if the UI is captured at 1/1000th of a second.

---

## 2. Colors: High-Contrast Precision
Our palette is rooted in the purity of a showroom floor. We use `primary` (#bc0009) as a surgical strike—a tool for focus, not a decorative wash.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts or tonal transitions. Use `surface-container-low` (#f3f3f4) to separate a feature block from the `surface` (#f9f9f9) background. If elements feel lost, increase the `spacing` rather than adding a line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use "Tonal Nesting" to define importance:
- **Level 0 (Base):** `surface` (#f9f9f9) - The canvas.
- **Level 1 (Sectioning):** `surface-container-low` (#f3f3f4) - Used for large content blocks.
- **Level 2 (Interaction):** `surface-container-lowest` (#ffffff) - Used for cards and interactive surfaces to make them "pop" against the off-white base.

### Signature Textures
While complex gradients are forbidden, use a **"Micro-Aero" Gradient** on main CTAs: a subtle shift from `primary` (#bc0009) to `primary-container` (#ea000e). This provides a "machined" finish that flat color cannot achieve, suggesting the curve of a car’s bodywork.

---

## 3. Typography: The Editorial Voice
Typography is the primary driver of our brand’s "High-Performance" feel.

- **Display & Headlines (`spaceGrotesk`):** These must be ultra-bold and condensed. Use `display-lg` (3.5rem) for hero statements. Tighten letter-spacing (tracking) to -2% or -4% to create a "block" of text that feels heavy and authoritative.
- **Body & Labels (`inter`):** Set to "Light" or "Regular" weights. The contrast between the massive, technical headlines and the airy, clean body text creates an "Architectural Digest" aesthetic. 
- **Hierarchy as Identity:** Use `on-surface-variant` (#5f3e3a) for sub-headers to create a tonal receding effect, allowing the `primary` red accents and `display` headlines to command the user's immediate attention.

---

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to simulate height; we use color and blur to simulate sophistication.

- **The Layering Principle:** Place a `surface-container-lowest` (#ffffff) card on a `surface-container` (#eeeeee) background. This creates a soft, natural lift.
- **Ambient Shadows:** For floating modals or high-priority items, use a shadow with a 40px–60px blur at 4% opacity, using a tint of `primary` (#bc0009) instead of black. This mimics the way light reflects off a red car onto a white floor.
- **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline-variant` (#eabcb5) at **15% opacity**. It should be felt, not seen.
- **Glassmorphism:** For navigation bars or floating "spec sheets," use `surface-container-lowest` at 80% opacity with a `backdrop-filter: blur(20px)`. This keeps the "Clean/Light" requirement while adding premium depth.

---

## 5. Components: The Primitive Set

### Buttons (The "Pill" Standard)
All buttons must use the `full` (9999px) roundness scale.
- **Primary:** `primary` (#bc0009) background, `on-primary` (#ffffff) text. Use `spacing-6` for horizontal padding to create an elongated, sleek look.
- **Secondary:** `surface-container-highest` (#e2e2e2) background with `on-surface` text. No border.

### Input Fields
- **Styling:** Use `surface-container-low` for the field background. On focus, transition the background to `surface-container-lowest` and add a 2px "Ghost Border" of `primary`.
- **Labels:** Use `label-md` in `on-surface-variant` positioned strictly above the field, never floating inside.

### Cards & Lists
**Strictly forbid divider lines.** 
- To separate items in a list, use a background toggle: Item 1 is `surface`, Item 2 is `surface-container-low`. 
- For Automotive Specs, use a "Data Grid" approach: Large `title-lg` values with `label-sm` descriptions underneath, separated by `spacing-8` of white space.

### Signature Automotive Components
- **The "Performance Gauge" Progress Bar:** A thick `surface-container-highest` pill with a `primary` red fill that uses a subtle glow (ambient shadow) to indicate "active" energy.
- **Spec Overlays:** Semi-transparent "Glass" pills that sit over car photography, using `backdrop-blur` to maintain legibility.

---

## 6. Do’s and Don’ts

### Do:
- **Do** use `spacing-16` and `spacing-20` between major sections. Generous whitespace is the hallmark of luxury.
- **Do** use "Pill" shapes for everything—images, buttons, and containers—to maintain the aerodynamic theme.
- **Do** use `primary` (#bc0009) sparingly. It should represent action and power (e.g., "Reserve Now," "Top Speed").

### Don’t:
- **Don’t** use 100% black (#000000) for text. Use `on-background` (#1a1c1c) to keep the look editorial and high-end.
- **Don’t** use standard 4px or 8px border-radii. If it’s not a pill (`full`), it’s not in the system.
- **Don’t** crowd the layout. If you can't fit a component with at least `spacing-4` of breathing room on all sides, the layout is too complex.