# Design System Specification: High-Performance Automotive Editorial

## 1. Overview & Creative North Star: "The Kinetic Monolith"
This design system is engineered to mirror the visceral experience of high-performance machinery. Our Creative North Star is **"The Kinetic Monolith"**—a visual language that feels heavy, expensive, and precision-engineered. We move away from the "friendly SaaS" aesthetic toward a high-end editorial feel.

The UI does not sit on a grid; it is carved out of an OLED void. We achieve a premium signature through:
*   **Aggressive Scale Contrast:** Massive, ultra-bold typography paired with surgical, diminutive labels.
*   **Intentional Asymmetry:** Layouts that lean into the "speed" of the content, using overlapping glass layers to create depth without clutter.
*   **Atmospheric Darkness:** Utilizing the absolute black of OLED screens to make vivid red accents feel like glowing instrumentation.

---

## 2. Colors & Surface Logic
The palette is restricted to a high-contrast triad: OLED Black, Vivid Red, and Metallic Greys. We strictly prohibit any cool-toned blues or purples to maintain a "mechanical" heat.

### Named Color Tokens (Material Design Convention)
*   **Background / Surface:** `#0A0A0A` (The Void)
*   **Primary:** `#FF1A1A` (Vivid Red / High-RPM)
*   **Secondary:** `#888888` (Mechanical Grey)
*   **On-Surface (Headlines):** `#FFFFFF`
*   **Surface-Container-Lowest:** `#0E0E0E`
*   **Surface-Container-Highest:** `#353534`

### The "No-Line" Rule
Standard 1px solid borders are strictly forbidden for sectioning content. Boundaries must be defined by:
1.  **Tonal Shifts:** Placing a `surface-container-low` (`#1C1B1B`) card against the `#0A0A0A` background.
2.  **Negative Space:** Using our specific spacing scale (e.g., `spacing-16`) to create "air" between high-performance specs.

### The "Glass & Gradient" Rule
Floating comparison modules must utilize the Glassmorphism system:
*   **Background:** `rgba(255, 255, 255, 0.03)`
*   **Backdrop Blur:** `12px`
*   **Edge Highlight:** Use a `0.5px` stroke of `primary` (`#FF1A1A`) at 30% opacity to simulate a laser-etched edge.
*   **Signature Texture:** For hero CTAs, apply a subtle linear gradient from `#FF1A1A` to `#930005` (Primary to On-Primary-Fixed-Variant) at a 135-degree angle to create a "redline" glow.

---

## 3. Typography
Typography is our primary tool for conveying power. We use two contrasting families: **Space Grotesk** (Condensed/Bold) for impact and **Inter** for technical precision.

*   **Display-LG (3.5rem / Space Grotesk):** Reserved for vehicle names and top-tier performance figures (e.g., 0-60 times). Use `letter-spacing: -0.05em`.
*   **Headline-MD (1.75rem / Space Grotesk):** For section titles. Always uppercase to evoke a racing scoreboard.
*   **Body-MD (0.875rem / Inter):** For technical descriptions. Use `line-height: 1.6` for maximum legibility against dark backgrounds.
*   **Label-SM (0.6875rem / Inter):** Used for technical metadata (e.g., "TORQUE", "DRIVETRAIN"). Always `#888888` with `letter-spacing: 0.1em`.

---

## 4. Elevation & Depth
In this design system, depth is a result of **Tonal Layering**, not drop shadows.

*   **The Layering Principle:** Stack surfaces to create focus.
    *   *Level 0:* `#0A0A0A` (Global Background)
    *   *Level 1:* `#131313` (Section Backgrounds)
    *   *Level 2:* `rgba(255, 255, 255, 0.03)` (Glass Cards)
*   **Ambient Shadows:** If a card must "float" (e.g., a modal), use a massive blur (`40px`) with `rgba(0, 0, 0, 0.8)`. Do not use light-colored shadows.
*   **The "Ghost Border" Fallback:** For interactive states (Hover/Focus), use the `outline-variant` token (`#5F3E3A`) at 20% opacity. Avoid 100% white or red borders unless it is a primary CTA.

---

## 5. Components

### Buttons
*   **Primary:** Vivid Red (`#FF1A1A`) background, white text, `rounded-sm` (0.125rem). The sharp corners imply precision engineering.
*   **Tertiary:** Transparent background with a `0.5px` Ghost Border. On hover, the border glows with 100% Primary Red.

### Comparison Cards
*   **Structure:** No divider lines. Use `surface-container-low` for the card body. 
*   **The "Spec-Row":** Use `spacing-4` padding between spec rows. Separate "Horsepower" from "Top Speed" using a subtle background shift to `surface-container-high` on alternating rows.

### Performance Chips
*   **Style:** `rounded-full`, background `surface-container-highest`, text `label-md`.
*   **Interaction:** On selection, the chip gains a `primary` drop-shadow "glow" (blur 8px, opacity 0.4).

### Input Fields
*   **Style:** Underline only. No box. The underline is `secondary` (`#888888`) at 20% opacity. On focus, the underline becomes `primary` (`#FF1A1A`) and expands from the center.

---

## 6. Do's and Don'ts

### Do:
*   **Do** lean into extreme contrast. If a spec is important, make it massive.
*   **Do** use Glassmorphism to overlay technical data over high-res car imagery.
*   **Do** use the OLED black (`#0A0A0A`) as a weapon to make the red accents "pop."

### Don't:
*   **Don't** use blue, purple, or teal for any reason. Even "Success" states should be white/grey; only use Red for the brand and Errors.
*   **Don't** use standard `rounded-lg` (0.5rem) corners. High-performance design is sharp. Stick to `sm` (0.125rem) or `none`.
*   **Don't** use dividers (`<hr>`). Use the Spacing Scale (24px or 32px) to let the content breathe.