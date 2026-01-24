# ShetiSetu Design System - Quick Start

## Overview

The ShetiSetu Design System is a complete UI/UX framework for building agricultural governance applications. It's optimized for farmers, officers, and higher authorities with multilingual support (Marathi, Hindi, English) and accessibility features.

## Quick Start

### View the Design System

Visit [http://localhost:5174/design-system](http://localhost:5174/design-system) to see an interactive showcase of all components.

### Import Components

```jsx
import {
  Button,
  Card,
  StatusBadge,
  SeverityIndicator,
  FileUpload,
  ProgressTracker,
  StatCard,
  LanguageSwitch,
  VoiceAssistant,
} from './components/ui';
```

### Use Layouts

```jsx
import FarmerLayout from './components/layouts/FarmerLayout';
import OfficerLayout from './components/layouts/OfficerLayout';
import AdminLayout from './components/layouts/AdminLayout';

function MyPage() {
  return (
    <FarmerLayout>
      {/* Your content */}
    </FarmerLayout>
  );
}
```

## Key Features

### 🎨 Agricultural Theme
- Primary green (#22c55e) representing growth and agriculture
- Earth brown for stability
- Sky blue for water and hope
- Severity indicators for crop loss levels

### 🌍 Multilingual Support
- English, Marathi (मराठी), Hindi (हिंदी)
- Devanagari script optimization
- Language switcher component

### 📱 Mobile-First
- Touch-friendly (48px minimum touch targets)
- Bottom navigation for farmers
- GPS-enabled photo upload
- High contrast for outdoor visibility

### ♿ Accessible
- WCAG 2.1 AA compliant
- Voice assistance for low-literacy users
- Keyboard navigation
- Screen reader support

### 🚜 Role-Based Layouts
- **FarmerLayout**: Simple, icon-heavy, voice-enabled
- **OfficerLayout**: Task-focused with notifications
- **AdminLayout**: Analytics and oversight dashboard

## Component Categories

### Base Components
- Button, Card, Input, Badge, Modal

### Status Components
- StatusBadge (8 application statuses)
- SeverityIndicator (low/medium/high crop damage)
- ProgressTracker (5-step application flow)

### Data Components
- StatCard (dashboard metrics)
- DocumentChecklist (KYC verification)

### Utility Components
- FileUpload (with GPS tagging)
- LanguageSwitch
- VoiceAssistant

## Color Usage

```jsx
// Tailwind classes
className="bg-primary-500 text-white"        // Primary button
className="bg-severity-high border-red-400"  // High damage indicator
className="text-accent-600"                   // Information text
```

## File Structure

```
frontend/src/
├── styles/
│   └── design-tokens.js        # Central design tokens
├── components/
│   ├── ui/                     # All UI components
│   │   ├── Button.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── FileUpload.jsx
│   │   └── ...
│   └── layouts/                # Role-based layouts
│       ├── FarmerLayout.jsx
│       ├── OfficerLayout.jsx
│       └── AdminLayout.jsx
├── pages/
│   └── DesignSystemShowcase.jsx
└── tailwind.config.js          # Custom theme config
```

## Example: Farmer Crop Loss Form

```jsx
import { useState } from 'react';
import FarmerLayout from './components/layouts/FarmerLayout';
import {
  Card,
  Input,
  Button,
  FileUpload,
  SeverityIndicator,
  VoiceAssistant,
} from './components/ui';

function CropLossReport() {
  const [severity, setSeverity] = useState('medium');

  return (
    <FarmerLayout>
      <Card padding="lg">
        <h2 className="text-2xl font-bold mb-6">
          Report Crop Loss
        </h2>

        <div className="space-y-6">
          <Input
            label="Farmer Name"
            name="name"
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              Damage Level
            </label>
            <div className="flex gap-3">
              <button onClick={() => setSeverity('low')}>
                <SeverityIndicator severity="low" />
              </button>
              <button onClick={() => setSeverity('medium')}>
                <SeverityIndicator severity="medium" />
              </button>
              <button onClick={() => setSeverity('high')}>
                <SeverityIndicator severity="high" />
              </button>
            </div>
          </div>

          <FileUpload
            label="Upload Damage Photos"
            captureGPS={true}
            multiple
            maxFiles={5}
          />

          <Button variant="primary" size="lg" fullWidth>
            Submit Report
          </Button>
        </div>
      </Card>

      <VoiceAssistant language="mr" />
    </FarmerLayout>
  );
}
```

## Documentation

Full documentation: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

## Design Tokens

Access centralized design tokens:

```javascript
import { designTokens } from './styles/design-tokens';

const primaryColor = designTokens.colors.primary[500];
const spacing = designTokens.spacing.xl;
```

## Best Practices

✅ Use StatusBadge for all application statuses
✅ Use SeverityIndicator for crop damage levels
✅ Enable GPS tagging for field photos
✅ Provide Marathi translations
✅ Use large touch targets on mobile
✅ Include voice assistance for farmers

❌ Don't use small fonts (< 14px) on mobile
❌ Don't hide critical actions in dropdowns
❌ Don't use complex navigation for farmers
❌ Don't skip loading states

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Accessibility

- Voice recognition (Web Speech API)
- Text-to-speech feedback
- Keyboard navigation
- High contrast mode support
- Screen reader compatible

---

**For detailed component API and examples, see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)**
