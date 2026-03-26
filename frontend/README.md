# Wheelify — Frontend

React.js application for the Wheelify platform.

## Tech Stack
- React.js 18
- Tailwind CSS 3
- Chart.js + react-chartjs-2
- React Router v6
- Axios (API calls)

## Folder Structure

```
src/
├── assets/            # Static files: fonts, images, icons
├── components/
│   ├── common/        # Reusable UI: Button, Badge, Card, Modal, Loader
│   ├── layout/        # Navbar, Footer, Sidebar
│   ├── sections/      # Landing page sections: Hero, Showcase, HowItWorks
│   ├── features/      # Feature modules: VehicleDiscovery, Comparison, etc.
│   └── charts/        # Chart components (Chart.js wrappers)
├── pages/             # Page-level components (routed screens)
├── hooks/             # Custom React hooks
├── context/           # React Context (global state)
├── services/          # API call functions
├── utils/             # Helper functions
├── styles/            # Global CSS, Tailwind config
├── config/            # App config, constants, env vars
└── types/             # TypeScript/JSDoc type definitions
```

## Design System

Color Palette:
- Background: `#0A0A0A` (OLED Black)
- Primary Accent: `#FF1A1A` (Vivid Red)
- Text Primary: `#FFFFFF`
- Text Secondary: `#888888`

Font: Space Grotesk (Display) + Inter (Body)
