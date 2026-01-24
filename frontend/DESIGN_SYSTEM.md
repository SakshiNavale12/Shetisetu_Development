# ShetiSetu Design System

A comprehensive design system for the ShetiSetu agricultural governance platform, connecting farmers, agricultural officers, and higher authorities for transparent crop survey and compensation.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Components](#components)
5. [Layouts](#layouts)
6. [Accessibility](#accessibility)
7. [Usage Examples](#usage-examples)

---

## Design Principles

### 1. Farmer-First Design
- **Large touch targets** (minimum 48px) for ease of use in field conditions
- **Simple navigation** with clear visual hierarchy
- **Minimal text**, maximum icons and visual cues
- **Voice assistance** for low-literacy users

### 2. Field-Ready
- **High contrast colors** for outdoor visibility
- **Offline-capable** design patterns
- **GPS integration** for location verification
- **Photo capture** optimized for mobile devices

### 3. Multilingual Support
- Primary support for **Marathi, Hindi, and English**
- **Devanagari script** optimization
- Voice assistance in all three languages

### 4. Government Compliance
- **Accessibility standards** (WCAG 2.1 AA)
- **Data privacy** considerations
- **Audit trail** in all interactions
- **Professional** yet approachable design

---

## Color System

### Brand Colors

#### Primary - Agricultural Green
Represents trust, growth, and nature. Used for primary actions and farmer-facing elements.

```css
primary-50:  #f0fdf4
primary-500: #22c55e  /* Main brand color */
primary-900: #14532d
```

**Usage:** Primary buttons, active states, success messages, crop-related elements

#### Secondary - Earth Brown
Represents soil, stability, and tradition.

```css
secondary-500: #bfa094
```

**Usage:** Secondary buttons, backgrounds, dividers

#### Accent - Sky Blue
Represents water, relief, and hope.

```css
accent-500: #0ea5e9
```

**Usage:** Links, information, water-related elements

### Status Colors

```css
Success: #10b981  /* Approved, Verified */
Warning: #f59e0b  /* Pending, Under Review */
Error:   #ef4444  /* Rejected, Error */
Info:    #3b82f6  /* Information */
```

### Crop Loss Severity

```css
severity-low:    #fef3c7  /* 0-33% damage */
severity-medium: #fed7aa  /* 34-66% damage */
severity-high:   #fecaca  /* 67-100% damage */
```

---

## Typography

### Font Families

```css
Primary: 'Inter', 'Noto Sans Devanagari', sans-serif
Secondary: 'Roboto', 'Noto Sans', sans-serif
```

**Note:** Noto Sans Devanagari ensures proper rendering of Marathi (मराठी) and Hindi (हिंदी) text.

### Font Sizes

```css
xs:   12px  /* Small labels */
sm:   14px  /* Body text, secondary info */
base: 16px  /* Default body text */
lg:   18px  /* Emphasized text */
xl:   20px  /* Subheadings */
2xl:  24px  /* Section headings */
3xl:  30px  /* Page titles */
4xl:  36px  /* Hero text */
```

### Mobile-First Considerations
- Base font size: **16px** (prevents zoom on iOS)
- Minimum touch target: **48px × 48px**
- Line height: **1.5** for readability

---

## Components

### Base Components

#### Button
Versatile button with multiple variants and sizes.

```jsx
import { Button } from './components/ui';

<Button variant="primary" size="lg" fullWidth>
  Submit Application
</Button>
```

**Variants:** `primary`, `secondary`, `success`, `error`, `warning`, `outline`
**Sizes:** `sm`, `md`, `lg`

#### Card
Container component for grouping content.

```jsx
import { Card } from './components/ui';

<Card padding="md" hover>
  {children}
</Card>
```

#### Input
Form input with validation support.

```jsx
import { Input } from './components/ui';

<Input
  label="Name"
  name="name"
  required
  error={errors.name}
  touched={touched.name}
/>
```

#### Modal
Overlay dialog for focused interactions.

```jsx
import { Modal } from './components/ui';

<Modal isOpen={isOpen} onClose={handleClose} title="Confirmation">
  {content}
</Modal>
```

### ShetiSetu Specific Components

#### StatusBadge
Displays application/case status with color coding.

```jsx
import { StatusBadge } from './components/ui';

<StatusBadge status="approved" />
<StatusBadge status="under_verification" />
<StatusBadge status="compensation_paid" />
```

**Statuses:**
- `submitted` - 📤 Submitted
- `under_verification` - 🔍 Under Verification
- `field_visit_scheduled` - 📅 Field Visit Scheduled
- `approved` - ✅ Approved
- `rejected` - ❌ Rejected
- `compensation_paid` - 💰 Compensation Paid
- `correction_required` - ✏️ Correction Required

#### SeverityIndicator
Shows crop loss severity level.

```jsx
import { SeverityIndicator } from './components/ui';

<SeverityIndicator severity="high" showLabel={true} size="lg" />
```

**Severities:**
- `low` - 🟡 0-33% damage
- `medium` - 🟠 34-66% damage
- `high` - 🔴 67-100% damage

#### FileUpload
Image/document upload with GPS tagging.

```jsx
import { FileUpload } from './components/ui';

<FileUpload
  label="Upload Crop Photos"
  accept="image/*"
  multiple
  captureGPS={true}
  maxFiles={5}
  onChange={handleFileChange}
/>
```

**Features:**
- Preview thumbnails
- GPS location capture
- File size display
- Timestamp recording

#### ProgressTracker
Step-by-step application progress visualization.

```jsx
import { ProgressTracker } from './components/ui';

<ProgressTracker currentStep={3} />
```

**Default Steps:**
1. 📝 Submitted
2. 📄 Document Verification
3. 🚜 Field Visit
4. ✅ Approval
5. 💰 Payment

#### StatCard
Dashboard statistics display.

```jsx
import { StatCard } from './components/ui';

<StatCard
  title="Total Applications"
  value="1,234"
  icon="📊"
  trend="up"
  trendValue="+12%"
  color="primary"
/>
```

#### DocumentChecklist
KYC and document verification status.

```jsx
import { DocumentChecklist } from './components/ui';

<DocumentChecklist
  documents={documents}
  onDocumentClick={handleDocClick}
/>
```

**Default Documents:**
- 🆔 Aadhaar Card (required)
- 📄 7/12 Land Extract (required)
- 🏦 Bank Passbook (required)
- 📝 Lease Agreement (optional)

#### LanguageSwitch
Multilingual language selector.

```jsx
import { LanguageSwitch } from './components/ui';

<LanguageSwitch
  currentLanguage={language}
  onLanguageChange={setLanguage}
/>
```

**Languages:**
- 🇬🇧 English
- 🇮🇳 मराठी (Marathi)
- 🇮🇳 हिंदी (Hindi)

#### VoiceAssistant
Voice guidance for low-literacy users.

```jsx
import { VoiceAssistant } from './components/ui';

<VoiceAssistant
  language={language}
  onCommand={handleVoiceCommand}
/>
```

**Features:**
- Speech recognition in Marathi, Hindi, English
- Text-to-speech feedback
- Floating action button
- Context-aware commands

---

## Layouts

### FarmerLayout
Optimized for farmers with simplified navigation.

```jsx
import FarmerLayout from './components/layouts/FarmerLayout';

<FarmerLayout>
  {/* Farmer dashboard content */}
</FarmerLayout>
```

**Features:**
- Bottom navigation (mobile)
- Large touch targets
- Voice assistant integration
- Helpline access

### OfficerLayout
Task-focused layout for agricultural officers.

```jsx
import OfficerLayout from './components/layouts/OfficerLayout';

<OfficerLayout>
  {/* Officer dashboard content */}
</OfficerLayout>
```

**Features:**
- Task notifications
- Pending case badges
- Quick stats sidebar
- Field visit scheduling

### AdminLayout
Analytics-focused layout for higher authorities.

```jsx
import AdminLayout from './components/layouts/AdminLayout';

<AdminLayout>
  {/* Admin dashboard content */}
</AdminLayout>
```

**Features:**
- Collapsible sidebar
- Search functionality
- Export capabilities
- Multi-level navigation

---

## Accessibility

### WCAG 2.1 AA Compliance

1. **Color Contrast**
   - Text: minimum 4.5:1 ratio
   - Large text: minimum 3:1 ratio
   - Interactive elements: clear focus states

2. **Keyboard Navigation**
   - All interactive elements are keyboard accessible
   - Logical tab order
   - Visible focus indicators

3. **Screen Reader Support**
   - Semantic HTML
   - ARIA labels where necessary
   - Alt text for images

4. **Touch Targets**
   - Minimum 48px × 48px for mobile
   - Adequate spacing between targets

5. **Multilingual**
   - Proper language attributes
   - Devanagari font support
   - RTL support (future)

### Voice Assistance
- Speech recognition in Marathi, Hindi, English
- Text-to-speech feedback
- Simple voice commands

---

## Usage Examples

### Farmer Application Form

```jsx
import { Button, Card, Input, FileUpload, SeverityIndicator } from './components/ui';
import FarmerLayout from './components/layouts/FarmerLayout';

function CropLossReport() {
  return (
    <FarmerLayout>
      <Card padding="lg">
        <h2 className="text-2xl font-bold mb-6">Report Crop Loss</h2>

        <Input
          label="Farmer Name"
          name="name"
          required
        />

        <SeverityIndicator severity="medium" />

        <FileUpload
          label="Upload Damage Photos"
          captureGPS={true}
          multiple
        />

        <Button variant="primary" size="lg" fullWidth>
          Submit Report
        </Button>
      </Card>
    </FarmerLayout>
  );
}
```

### Officer Dashboard

```jsx
import { StatCard, StatusBadge } from './components/ui';
import OfficerLayout from './components/layouts/OfficerLayout';

function OfficerDashboard() {
  return (
    <OfficerLayout>
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard
          title="Pending Cases"
          value="12"
          icon="⏳"
          color="warning"
        />
        <StatCard
          title="Completed Today"
          value="8"
          icon="✅"
          color="success"
        />
        <StatCard
          title="Field Visits"
          value="5"
          icon="🚜"
          color="accent"
        />
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Recent Applications</h3>
        {applications.map(app => (
          <div key={app.id} className="flex justify-between items-center p-4 bg-white rounded-lg mb-2">
            <span>{app.farmerName}</span>
            <StatusBadge status={app.status} />
          </div>
        ))}
      </div>
    </OfficerLayout>
  );
}
```

### Admin Analytics

```jsx
import { StatCard } from './components/ui';
import AdminLayout from './components/layouts/AdminLayout';

function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">District Overview</h1>

      <div className="grid md:grid-cols-4 gap-6">
        <StatCard
          title="Total Applications"
          value="1,234"
          icon="📊"
          trend="up"
          trendValue="+12%"
          color="primary"
        />
        <StatCard
          title="Approved Cases"
          value="856"
          icon="✅"
          trend="up"
          trendValue="+8%"
          color="success"
        />
        <StatCard
          title="Compensation Paid"
          value="₹45.6L"
          icon="💰"
          color="accent"
        />
        <StatCard
          title="Active Officers"
          value="42"
          icon="👥"
          color="secondary"
        />
      </div>
    </AdminLayout>
  );
}
```

---

## Design Tokens

All design tokens are centralized in `src/styles/design-tokens.js`:

```javascript
import { designTokens } from './styles/design-tokens';

// Access tokens
const primaryColor = designTokens.colors.primary[500];
const largeSpacing = designTokens.spacing.xl;
```

---

## Tailwind Configuration

Custom Tailwind configuration extends the default theme with ShetiSetu brand colors and utilities. See `tailwind.config.js` for full configuration.

**Custom Classes:**
```css
bg-primary-500      /* Agricultural green */
text-severity-high  /* Crop loss severity */
shadow-soft         /* Custom shadow */
animate-fade-in     /* Custom animation */
```

---

## Best Practices

### Do's ✅
- Use semantic HTML
- Provide multilingual labels
- Include voice assistance on farmer-facing pages
- Use GPS tagging for field photos
- Implement proper error handling
- Show clear progress indicators
- Use large touch targets on mobile

### Don'ts ❌
- Don't use complex navigation for farmer portal
- Don't rely solely on color to convey information
- Don't use small fonts (< 14px) on mobile
- Don't hide critical actions in menus
- Don't skip loading states
- Don't ignore offline scenarios

---

## File Structure

```
frontend/src/
├── styles/
│   └── design-tokens.js           # Design system tokens
├── components/
│   ├── ui/                        # UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Badge.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── SeverityIndicator.jsx
│   │   ├── FileUpload.jsx
│   │   ├── ProgressTracker.jsx
│   │   ├── StatCard.jsx
│   │   ├── LanguageSwitch.jsx
│   │   ├── VoiceAssistant.jsx
│   │   ├── DocumentChecklist.jsx
│   │   └── index.js               # Barrel exports
│   └── layouts/                   # Layout components
│       ├── FarmerLayout.jsx
│       ├── OfficerLayout.jsx
│       └── AdminLayout.jsx
├── pages/                         # Page components
└── tailwind.config.js             # Tailwind configuration
```

---

## Contributing

When adding new components to the design system:

1. Follow existing component patterns
2. Include Marathi translations for labels
3. Ensure WCAG 2.1 AA compliance
4. Add usage examples to documentation
5. Update barrel exports in `index.js`
6. Test on mobile devices
7. Test with voice assistance

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Noto Sans Devanagari Font](https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

**Version:** 1.0.0
**Last Updated:** 2025-12-29
**Maintainers:** ShetiSetu Development Team
