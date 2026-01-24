import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  Input,
  Badge,
  Modal,
  StatusBadge,
  SeverityIndicator,
  FileUpload,
  ProgressTracker,
  StatCard,
  LanguageSwitch,
  VoiceAssistant,
  DocumentChecklist,
} from '../components/ui';

/**
 * DesignSystemShowcase
 * Interactive showcase of all ShetiSetu design system components
 */

function DesignSystemShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currentStep, setCurrentStep] = useState(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600 flex items-center gap-2">
              <span>🌾</span>
              <span>ShetiSetu</span>
            </Link>
            <Link to="/" className="text-sm text-gray-600 hover:text-primary-600">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-primary-500 rounded-lg flex items-center justify-center text-3xl">
                🌾
              </div>
              <div className="text-left">
                <h1 className="text-5xl font-bold text-gray-900">ShetiSetu</h1>
                <p className="text-sm text-gray-600">Design System Showcase</p>
              </div>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive design system for agricultural governance platform
            </p>
          </div>

          {/* Color Palette */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Color Palette</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Primary - Agricultural Green</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-500 rounded shadow" />
                    <span className="text-sm">primary-500</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Secondary - Earth Brown</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary-500 rounded shadow" />
                    <span className="text-sm">secondary-500</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Accent - Sky Blue</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent-500 rounded shadow" />
                    <span className="text-sm">accent-500</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Buttons */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Buttons</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="success">Success</Button>
                <Button variant="error">Error</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="outline">Outline</Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
          </Card>

          {/* Status Badges */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Status Badges</h2>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="submitted" />
              <StatusBadge status="under_verification" />
              <StatusBadge status="field_visit_scheduled" />
              <StatusBadge status="approved" />
              <StatusBadge status="rejected" />
              <StatusBadge status="compensation_paid" />
              <StatusBadge status="correction_required" />
            </div>
          </Card>

          {/* Severity Indicators */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Severity Indicators</h2>
            <div className="flex flex-wrap gap-4">
              <SeverityIndicator severity="low" size="lg" />
              <SeverityIndicator severity="medium" size="lg" />
              <SeverityIndicator severity="high" size="lg" />
            </div>
          </Card>

          {/* Stat Cards */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Stat Cards</h2>
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
                title="Approved"
                value="856"
                icon="✅"
                trend="up"
                trendValue="+8%"
                color="success"
              />
              <StatCard
                title="Pending"
                value="245"
                icon="⏳"
                trend="down"
                trendValue="-3%"
                color="warning"
              />
              <StatCard
                title="Compensation"
                value="₹45.6L"
                icon="💰"
                color="accent"
              />
            </div>
          </Card>

          {/* Progress Tracker */}
          <Card className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Progress Tracker</h2>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}>
                  Previous
                </Button>
                <Button size="sm" onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}>
                  Next
                </Button>
              </div>
            </div>
            <ProgressTracker currentStep={currentStep} />
          </Card>

          {/* Language Switch */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Language Switch</h2>
            <LanguageSwitch currentLanguage={language} onLanguageChange={setLanguage} />
          </Card>

          {/* Document Checklist */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Document Checklist</h2>
            <DocumentChecklist />
          </Card>

          {/* File Upload */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold mb-6">File Upload with GPS</h2>
            <FileUpload
              label="Upload Crop Photos"
              accept="image/*"
              multiple
              captureGPS={true}
              maxFiles={5}
            />
          </Card>

          {/* Modal */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Modal</h2>
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Example Modal">
              <p className="text-gray-600 mb-4">
                This is a reusable modal component built with React and Tailwind CSS.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                  Confirm
                </Button>
              </div>
            </Modal>
          </Card>

          {/* Form Inputs */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Form Inputs</h2>
            <div className="space-y-4 max-w-md">
              <Input label="Farmer Name" name="name" placeholder="Enter name" required />
              <Input
                label="Mobile Number"
                name="mobile"
                type="tel"
                placeholder="10-digit mobile number"
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                error="Invalid email address"
                touched={true}
              />
            </div>
          </Card>

          {/* Badges */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Badges</h2>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </Card>

          {/* Voice Assistant */}
          <VoiceAssistant
            language={language}
            onCommand={(command) => console.log('Voice command:', command)}
          />
        </div>
      </div>
    </div>
  );
}

export default DesignSystemShowcase;
