<!-- # DiaguARd Frontend

React + TypeScript + Vite frontend application for DiaguARd health monitoring system.

## Tech Stack

- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Three.js** - 3D graphics
- **Material-UI** - Component library
- **Radix UI** - Headless UI components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
```

### Development

```bash
# Start development server
npm run dev
# or
pnpm dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build
# or
pnpm build
```

### Preview Production Build

```bash
# Preview production build
npm run preview
# or
pnpm preview
```

## Project Structure

```
src/
├── app/
│   ├── App.tsx                 # Main application component
│   └── components/             # React components
│       ├── Dashboard.tsx
│       ├── HealthForm.tsx
│       ├── ResultsModal.tsx
│       ├── figma/              # Figma-imported components
│       └── ui/                 # Reusable UI components
├── styles/                     # Global styles and themes
└── main.tsx                    # Application entry point
```

## Key Features

- Health data input forms
- 3D visualization with Three.js
- Real-time health monitoring dashboard
- Responsive design
- Accessible UI components

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000
``` -->
