# Design System: High-End Automotive Editorial

## 1. Overview & Creative North Star: "The Kinetic Noir"
This design system is engineered to evoke the atmosphere of a high-performance nocturnal drive. The "Creative North Star" is **Kinetic Noir**—a philosophy that balances the absolute stillness of an OLED black void with the aggressive energy of high-contrast typography and red atmospheric luminescence. 

To break the "template" look, designers must lean into **intentional asymmetry**. Layouts should not feel like a rigid grid; they should feel like a curated editorial spread. Use massive display type that bleeds off-canvas, overlapping glass containers that catch the "red glow," and wide-open negative space to establish a premium, automotive luxury feel.

---

## 2. Colors & Atmosphere
The palette is restricted to a high-tension range of deep reds and blacks. Blue and purple tones are strictly prohibited to maintain the "Aggressive Luxury" aesthetic.

### Core Palette
*   **Background (`#0A0A0A`):** The absolute base. All screens must begin here.
*   **The Atmospheric Core:** A single, large radial gradient (`#1A0000`) must be positioned at the center of the viewport (or behind the primary hero element) to provide a soft, pulsing depth.
*   **The Texture:** A global 4% opacity film grain noise overlay must sit atop the entire UI to kill the "flat digital" feel and introduce a tactile, cinematic quality.

### Functional Tokens (Material Mapping)
*   **Primary (`#ffb4a9`):** Use sparingly for high-action CTAs.
*   **Surface (`#131313`):** The standard "lifted" base.
*   **Surface-Container-Lowest (`#0e0e0e`):** Used for recessed areas or subtle background shifts.
*   **Surface-Container-Highest (`#353534`):** Used for elevated interactive elements.

### The "No-Line" Rule
Prohibit 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts or the transition between the OLED black and the red radial glow. If two sections meet, separate them with a shift from `surface` to `surface-container-low`.

### The "Glass & Gradient" Rule
Floating UI elements (cards, modals) must use Glassmorphism:
*   **Fill:** `rgba(255, 255, 255, 0.03)`
*   **Border:** 1px `rgba(255, 26, 26, 0.15)` (The "Ghost Border")
*   **Blur:** 12px Backdrop Blur.
This ensures that the red core gradient "bleeds" through the UI, integrating the content with the atmosphere.

---

## 3. Typography: The Power of Contrast
The typographic identity relies on the tension between "The Engine" (Headlines) and "The Interior" (Body).

*   **Display & Headlines (Epilogue - Ultra Bold/Condensed):** Use `display-lg` (3.5rem) and `headline-lg` (2rem). These should be tracked tightly (-2% to -4%) to feel like a stamped VIN plate or a performance speedometer.
*   **Body & Titles (Plus Jakarta Sans - Light/Regular):** Use `body-lg` (1rem) for readability. This font provides a modern, clean counterpoint to the aggressive headlines, mimicking the sleek digital displays of a luxury cockpit.
*   **Labels (Inter - Medium):** Use `label-md` (0.75rem) for technical data, all-caps with increased letter spacing (10%) to suggest precision instrumentation.

---

## 4. Elevation & Depth
Depth in this system is achieved through **Tonal Layering**, not shadows.

*   **The Layering Principle:** Treat the UI as layers of light. Place a `surface-container-lowest` card on a `surface` section to create a "sunken" effect. 
*   **Ambient Shadows:** If an element must float (like a FAB), use a highly diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6)`. Never use harsh, high-opacity shadows.
*   **Ghost Borders:** The only permitted border is the 1px `rgba(255, 26, 26, 0.15)` used on glass cards. This acts as a "specular highlight" on the edge of a car panel rather than a structural container.

---

## 5. Components

### Buttons
*   **Primary:** High-contrast `primary` (`#ffb4a9`) background with `on-primary` (`#690002`) text. Square corners (`none` or `sm`).
*   **Secondary:** Glassmorphic fill with a `primary` ghost border.
*   **Interaction:** On hover, increase the `backdrop-blur` from 12px to 20px and increase the border opacity to 0.3.

### Cards & Lists
*   **The Divider Rule:** Forbid the use of divider lines. Use `16` (5.5rem) spacing to separate list clusters, or a subtle background shift to `surface-container-low`.
*   **Glass Cards:** Use for "floating" content blocks. Ensure they always sit over the red radial gradient for maximum visual impact.

### Input Fields
*   **Style:** Minimalist. No background fill. Use a single bottom border (`outline-variant` at 20% opacity). 
*   **Focus State:** The bottom border transitions to `primary` and a subtle red glow (`0 4px 12px rgba(255, 26, 26, 0.1)`) appears beneath the line.

### Additional: "Performance Gauges" (Data Viz)
Since this is an automotive aesthetic, use thin, circular progress rings and linear bars with `primary` gradients to represent data, avoiding standard blocky bar charts.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use massive scale contrast. A 3.5rem headline next to a 0.75rem label creates luxury "breathing room."
*   **Do** allow images to bleed into the background. Use "Multiply" or "Overlay" blend modes on images to pull the red/black tones into the photography.
*   **Do** keep corner radii sharp (`none` to `md`). Luxury automotive design is about precision, not "bubbly" friendliness.

### Don't:
*   **Don't** use pure white text (`#FFFFFF`). Use `on-surface` (`#e5e2e1`) to keep the highlights from feeling "cheap" against the OLED black.
*   **Don't** use purple, blue, or green for any state. Errors should be a saturated red; success should be a muted, desaturated grey-red.
*   **Don't** center-align long blocks of text. Stick to strong left-aligned editorial "columns."