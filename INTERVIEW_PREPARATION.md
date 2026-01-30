# ShetiSetu (शेतीसेतू) - Complete Project Documentation
## Interview & Presentation Preparation Guide

---

# Table of Contents
1. [Problem Statement & Solution](#1-problem-statement--solution)
2. [Project Architecture](#2-project-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Frontend Deep Dive](#4-frontend-deep-dive)
5. [Backend Deep Dive](#5-backend-deep-dive)
6. [API Documentation](#6-api-documentation)
7. [Security Implementation](#7-security-implementation)
8. [Environment Configuration](#8-environment-configuration)
9. [ML Service](#9-ml-service)
10. [Interview Q&A](#10-interview-qa)

---

# 1. Problem Statement & Solution

## The Problem

Maharashtra farmers face significant challenges in the agricultural governance system:

| Problem | Impact |
|---------|--------|
| Manual crop survey process | Delays, errors, corruption |
| Paper-based loss reporting | Lost documents, slow verification |
| No transparency in compensation | Farmers unaware of claim status |
| Language barriers | Government portals only in English |
| Lack of digital literacy | Complex interfaces unusable |

## The Solution: ShetiSetu

**ShetiSetu** (Agricultural Bridge) is a digital governance platform that connects farmers with agricultural officers for:

1. **e-Pik Pahani (ई-पिक पाहणी)** - Digital Crop Survey
2. **Loss Report & Verification** - Damage claim system
3. **e-Panchanama** - Digital field inspection
4. **Compensation Tracking** - Payment status updates
5. **Smart Predictions** - ML-based crop recommendations

## Key Features

```
┌─────────────────────────────────────────────────────────────────┐
│                        SHETISETU PLATFORM                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  👨‍🌾 FARMER                    👮 OFFICER                       │
│  ├── Register crops            ├── Verify crop surveys         │
│  ├── Report losses             ├── Conduct e-Panchanama        │
│  ├── Track compensation        ├── Process loss reports        │
│  ├── View predictions          ├── Manage farmer records       │
│  └── Multilingual support      └── Dashboard & statistics      │
│                                                                 │
│  🏛️ AUTHORITY                  🔧 ADMIN                         │
│  ├── Review panchanamas        ├── Manage all users            │
│  ├── Approve/reject claims     ├── System configuration        │
│  └── View all cases            └── View all data               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# 2. Project Architecture

## Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                    (React.js Frontend)                          │
│              Browser / Mobile Web Interface                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS (REST API)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                             │
│                   (Node.js + Express.js)                        │
│         Authentication, Business Logic, API Endpoints           │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
┌───────────────────────────┐ ┌───────────────────────────────────┐
│      DATA LAYER           │ │        ML SERVICE                 │
│     (MongoDB)             │ │    (Python + Flask)               │
│   Document Database       │ │   Crop Predictions                │
└───────────────────────────┘ └───────────────────────────────────┘
```

## Folder Structure

```
Shetisetu_MajorProject/
├── frontend/                 # React.js Application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── store/            # Redux state management
│   │   ├── services/         # API service functions
│   │   ├── locales/          # i18n translations
│   │   └── utils/            # Helper functions
│   └── package.json
│
├── backend/                  # Node.js API Server
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Request handlers
│   │   ├── middlewares/      # Auth, validation, etc.
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utilities
│   │   └── validations/      # Joi validation schemas
│   └── package.json
│
└── ml-service/               # Python ML Service
    ├── app.py                # Flask application
    ├── models/               # Trained ML models
    └── requirements.txt
```

---

# 3. Technology Stack

## Frontend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| React.js | UI Library | 19.x |
| Vite | Build Tool | 6.x |
| React Router | Navigation | 7.x |
| Redux Toolkit | State Management | 2.x |
| Tailwind CSS | Styling | 4.x |
| Formik + Yup | Form Handling & Validation | - |
| i18next | Internationalization | - |
| Axios | HTTP Client | - |
| Lucide React | Icons | - |

## Backend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| Node.js | Runtime | 18.x+ |
| Express.js | Web Framework | 4.x |
| MongoDB | Database | 6.x |
| Mongoose | ODM | 8.x |
| Passport.js | Authentication | - |
| JWT | Token-based Auth | - |
| Joi | Validation | - |
| Multer + Sharp | File Upload & Processing | - |
| Nodemailer | Email Service | - |

## ML Service Technologies

| Technology | Purpose |
|------------|---------|
| Python | Programming Language |
| Flask | Web Framework |
| Scikit-learn | ML Algorithms |
| Pandas | Data Processing |
| NumPy | Numerical Computing |

---

# 4. Frontend Deep Dive

## Entry Point: main.jsx

```javascript
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import { store } from './store';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>      {/* Redux state available everywhere */}
    <BrowserRouter>             {/* Enables routing */}
      <App />
    </BrowserRouter>
  </Provider>
)
```

## Routing: App.jsx

```javascript
// Role-based redirection
function HomeRedirect() {
  const user = localStorage.getItem('user');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const parsedUser = JSON.parse(user);

  // Redirect based on role
  if (parsedUser.role === 'farmer') {
    return <Navigate to="/dashboard" replace />;
  } else if (['officer', 'authority', 'admin'].includes(parsedUser.role)) {
    return <Navigate to="/officer/dashboard" replace />;
  }
}

// Route definitions
<Routes>
  <Route path="/" element={<HomeRedirect />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Protected routes inside Layout */}
  <Route element={<Layout />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/crop-survey" element={<CropSurvey />} />
    <Route path="/loss-report" element={<LossReport />} />
    <Route path="/officer/dashboard" element={<OfficerDashboard />} />
  </Route>
</Routes>
```

## Key Pages Explained

### Login.jsx
- Uses Formik for form management
- Yup for validation (email format, password required)
- Stores JWT tokens in localStorage on success
- Redirects based on user role

### Register.jsx
- Multi-step registration (user type → credentials → profile)
- Role selection: Farmer or Officer
- Language preference selection
- Joi validation on backend

### Dashboard.jsx (Farmer)
- Displays farmer statistics (total crops, pending surveys)
- Shows government schemes
- Quick action buttons (New Survey, Report Loss)
- Recent activity feed

### CropSurvey.jsx
- Dual-purpose: List existing + Create new
- Form fields: Crop type, Season, Area, GPS location
- Image upload with geo-tagging
- Status tracking (draft → submitted → verified)

### LossReport.jsx
- Report crop damage/loss
- Damage types: Flood, Drought, Pest, Disease, Other
- Damage percentage slider (0-100%)
- Photo evidence upload
- Links to existing crop survey

### OfficerDashboard.jsx
- Tabbed interface:
  - Farmers list (manage farmer profiles)
  - Pending Reports (verify loss reports)
  - eKYC (verify farmer identity)
  - Panchanamas (field inspections)
- Statistics and quick actions

## UI Components

| Component | Purpose |
|-----------|---------|
| Button.jsx | Reusable button with variants (primary, secondary, danger) |
| Card.jsx | Container with shadow and padding |
| Input.jsx | Form input with label and error display |
| Badge.jsx | Status indicators (Pending, Approved, Rejected) |
| FileUpload.jsx | Image upload with GPS capture |
| Modal.jsx | Popup dialogs |
| Sidebar.jsx | Navigation menu |

## Redux Store Structure

```javascript
store/
├── index.js              # Store configuration
├── slices/
│   ├── authSlice.js      # User authentication state
│   ├── farmerSlice.js    # Farmer profile data
│   ├── cropSurveySlice.js    # Crop surveys
│   ├── lossReportSlice.js    # Loss reports
│   └── notificationSlice.js  # Notifications
```

---

# 5. Backend Deep Dive

## Backend Architecture Pattern

```
Request Flow:
┌─────────┐    ┌────────────┐    ┌────────────┐    ┌─────────┐    ┌──────────┐
│ Client  │───▶│   Routes   │───▶│ Middleware │───▶│Controller│───▶│ Service  │
└─────────┘    └────────────┘    └────────────┘    └─────────┘    └──────────┘
                                                                        │
                                                                        ▼
┌─────────┐    ┌────────────┐    ┌────────────┐    ┌─────────┐    ┌──────────┐
│ Client  │◀───│  Response  │◀───│ Controller │◀───│ Service │◀───│  Model   │
└─────────┘    └────────────┘    └────────────┘    └─────────┘    └──────────┘
```

| Layer | Responsibility | Example File |
|-------|----------------|--------------|
| Routes | Define endpoints, apply middlewares | auth.route.js |
| Middlewares | Auth, validation, rate limiting | auth.js, validate.js |
| Controllers | Handle request/response | auth.controller.js |
| Services | Business logic | auth.service.js |
| Models | Database schema & operations | user.model.js |

## Entry Point: index.js

```javascript
const app = require('./app');
const config = require('./config/config');

mongoose.connect(config.mongoose.url).then(() => {
  console.log('Connected to MongoDB');
  server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close();
});
```

## Middleware Stack: app.js

```javascript
// Security middlewares
app.use(helmet());           // HTTP security headers
app.use(xss());              // XSS protection
app.use(mongoSanitize());    // NoSQL injection prevention

// Parsing
app.use(express.json());     // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());      // Gzip responses

// CORS
app.use(cors());             // Cross-origin requests

// Authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// Rate limiting (production only)
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// Routes
app.use('/v1', routes);

// Error handling
app.use(errorConverter);
app.use(errorHandler);
```

## Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  mobile: String (unique),
  password: String (hashed with bcrypt),
  role: ['farmer', 'officer', 'authority', 'admin'],
  isEmailVerified: Boolean,
  preferredLanguage: ['en', 'hi', 'mr']
}
```

### Farmer Model
```javascript
{
  user: ObjectId (ref: User),

  // Personal Info
  aadhaarNumber: String (private),
  dateOfBirth: Date,
  gender: ['male', 'female', 'other'],

  // Address
  address: {
    village: String,
    taluka: String,
    district: String,
    state: String (default: Maharashtra),
    pincode: String
  },

  // Land Details
  landDetails: {
    surveyNumber: String,
    totalArea: Number,
    irrigationType: ['rainfed', 'irrigated', 'mixed']
  },

  // Bank Details (PRIVATE - not sent in API responses)
  bankDetails: {
    accountNumber: String (private: true),
    ifscCode: String,
    bankName: String
  },

  // KYC Status
  kycStatus: ['pending', 'verified', 'rejected'],
  kycVerifiedBy: ObjectId (ref: User)
}
```

### Crop Survey Model
```javascript
{
  farmer: ObjectId (ref: Farmer),
  season: ['kharif', 'rabi', 'summer'],
  year: Number,

  crops: [{
    name: String,
    localName: String,
    area: Number,
    expectedYield: Number
  }],

  landPhotos: [{
    url: String,
    gpsCoordinates: { latitude, longitude },
    capturedAt: Date
  }],

  status: ['draft', 'submitted', 'under_review', 'verified', 'rejected'],

  verifiedBy: ObjectId (ref: User),
  verificationDate: Date,
  remarks: String
}
```

### Loss Report Model
```javascript
{
  farmer: ObjectId (ref: Farmer),
  cropSurvey: ObjectId (ref: CropSurvey),

  lossDetails: {
    causeOfLoss: ['flood', 'drought', 'pest', 'disease', 'hailstorm', 'other'],
    description: String,
    dateOfLoss: Date,
    estimatedLossPercentage: Number (0-100),
    affectedArea: Number
  },

  evidence: [{
    url: String,
    gpsCoordinates: { latitude, longitude }
  }],

  status: ['submitted', 'under_review', 'verified', 'rejected', 'compensation_approved'],

  verifiedBy: ObjectId,
  compensation: {
    amount: Number,
    status: ['pending', 'approved', 'disbursed'],
    disbursedDate: Date
  }
}
```

### Panchanama Model
```javascript
{
  lossReport: ObjectId (ref: LossReport),
  officer: ObjectId (ref: User),

  siteVisit: {
    scheduledDate: Date,
    actualDate: Date,
    gpsCoordinates: { latitude, longitude }
  },

  inspection: {
    cropCondition: String,
    actualLossPercentage: Number,
    weatherConditions: String,
    witnessNames: [String]
  },

  photos: [{
    url: String,
    description: String,
    gpsCoordinates: { latitude, longitude }
  }],

  recommendation: {
    isEligible: Boolean,
    recommendedAmount: Number,
    remarks: String
  },

  status: ['draft', 'submitted', 'approved', 'rejected'],
  reviewedBy: ObjectId (ref: User),
  reviewRemarks: String
}
```

## Role-Based Access Control (RBAC)

```javascript
// config/roles.js
const allRoles = {
  farmer: [
    'manageFarmerProfile',
    'submitCropSurvey',
    'submitLossReport'
  ],
  officer: [
    'getUsers',
    'manageFarmers',
    'verifyCropSurvey',
    'verifyLossReport',
    'conductPanchanama'
  ],
  authority: [
    'getUsers',
    'manageFarmers',
    'viewAllCases',
    'reviewPanchanama',
    'approveCompensation'
  ],
  admin: [
    'getUsers',
    'manageUsers',
    'manageFarmers',
    'viewAllCases',
    'manageSystem'
  ],
};
```

---

# 6. API Documentation

## Authentication APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/v1/auth/register` | Register new user | No |
| POST | `/v1/auth/login` | Login with email/mobile | No |
| POST | `/v1/auth/logout` | Logout (invalidate token) | Yes |
| POST | `/v1/auth/refresh-tokens` | Get new access token | No (needs refresh token) |
| POST | `/v1/auth/forgot-password` | Request password reset email | No |
| POST | `/v1/auth/reset-password` | Reset password with token | No |
| POST | `/v1/auth/send-verification-email` | Send email verification | Yes |
| POST | `/v1/auth/verify-email` | Verify email with token | No |

### Login Example

**Request:**
```json
POST /v1/auth/login
{
  "identifier": "farmer@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Ramesh Patil",
    "email": "farmer@example.com",
    "role": "farmer"
  },
  "tokens": {
    "access": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "expires": "2024-01-15T10:30:00Z"
    },
    "refresh": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "expires": "2024-02-14T10:00:00Z"
    }
  }
}
```

## User Management APIs

| Method | Endpoint | Description | Auth/Permission |
|--------|----------|-------------|-----------------|
| POST | `/v1/users` | Create user (admin only) | admin |
| GET | `/v1/users` | Get all users | getUsers |
| GET | `/v1/users/:userId` | Get user by ID | getUsers |
| PATCH | `/v1/users/:userId` | Update user | manageUsers |
| DELETE | `/v1/users/:userId` | Delete user | manageUsers |

## Farmer APIs

| Method | Endpoint | Description | Auth/Permission |
|--------|----------|-------------|-----------------|
| POST | `/v1/farmers` | Create farmer profile | farmer |
| GET | `/v1/farmers` | Get all farmers | manageFarmers |
| GET | `/v1/farmers/me` | Get own profile | farmer |
| GET | `/v1/farmers/:farmerId` | Get farmer by ID | manageFarmers |
| PATCH | `/v1/farmers/:farmerId` | Update farmer | manageFarmers |
| PATCH | `/v1/farmers/:farmerId/kyc` | Verify farmer KYC | manageFarmers |

## Crop Survey APIs

| Method | Endpoint | Description | Auth/Permission |
|--------|----------|-------------|-----------------|
| POST | `/v1/crop-surveys` | Create new survey | farmer |
| GET | `/v1/crop-surveys` | Get farmer's surveys | farmer |
| GET | `/v1/crop-surveys/all` | Get all surveys | verifyCropSurvey |
| GET | `/v1/crop-surveys/:id` | Get survey details | farmer/officer |
| PATCH | `/v1/crop-surveys/:id` | Update survey | farmer |
| POST | `/v1/crop-surveys/:id/submit` | Submit for verification | farmer |
| POST | `/v1/crop-surveys/:id/verify` | Verify survey | verifyCropSurvey |

## Loss Report APIs

| Method | Endpoint | Description | Auth/Permission |
|--------|----------|-------------|-----------------|
| POST | `/v1/loss-reports` | Create loss report | farmer |
| GET | `/v1/loss-reports` | Get farmer's reports | farmer |
| GET | `/v1/loss-reports/all` | Get all reports | verifyLossReport |
| GET | `/v1/loss-reports/:id` | Get report details | farmer/officer |
| PATCH | `/v1/loss-reports/:id` | Update report | farmer |
| POST | `/v1/loss-reports/:id/verify` | Verify report | verifyLossReport |

## Panchanama APIs

| Method | Endpoint | Description | Auth/Permission |
|--------|----------|-------------|-----------------|
| POST | `/v1/panchanamas` | Create panchanama | conductPanchanama |
| GET | `/v1/panchanamas` | Get officer's panchanamas | conductPanchanama |
| GET | `/v1/panchanamas/stats` | Get officer statistics | conductPanchanama |
| GET | `/v1/panchanamas/all` | Get all panchanamas | viewAllCases |
| GET | `/v1/panchanamas/:id` | Get panchanama details | conductPanchanama |
| PATCH | `/v1/panchanamas/:id` | Update panchanama | conductPanchanama |
| POST | `/v1/panchanamas/:id/submit` | Submit for review | conductPanchanama |
| POST | `/v1/panchanamas/:id/review` | Review panchanama | reviewPanchanama |

## Notification APIs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/notifications` | Get user notifications | Yes |
| GET | `/v1/notifications/unread-count` | Get unread count | Yes |
| PATCH | `/v1/notifications/read-all` | Mark all as read | Yes |
| PATCH | `/v1/notifications/:id/read` | Mark one as read | Yes |
| DELETE | `/v1/notifications/:id` | Delete notification | Yes |

## File Upload APIs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/v1/uploads/image` | Upload single image | Yes |
| POST | `/v1/uploads/images` | Upload multiple images | Yes |
| POST | `/v1/uploads/document` | Upload document | Yes |

## Prediction APIs (ML Service)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/v1/predictions/crop` | Get crop recommendations | Yes |
| POST | `/v1/predictions/yield` | Predict crop yield | Yes |
| POST | `/v1/predictions/loss` | Assess loss from images | Yes |

---

# 7. Security Implementation

## Security Layers Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: TRANSPORT                                             │
│  └── HTTPS encryption (TLS 1.3)                                 │
│                                                                 │
│  Layer 2: RATE LIMITING                                         │
│  └── express-rate-limit (20 failed auth requests/15 min)        │
│                                                                 │
│  Layer 3: HTTP HEADERS                                          │
│  └── Helmet.js (XSS, Clickjacking, MIME sniffing protection)    │
│                                                                 │
│  Layer 4: INPUT VALIDATION                                      │
│  ├── Joi schema validation                                      │
│  ├── XSS-clean sanitization                                     │
│  └── mongo-sanitize (NoSQL injection prevention)                │
│                                                                 │
│  Layer 5: AUTHENTICATION                                        │
│  ├── JWT tokens (access + refresh)                              │
│  ├── Passport.js JWT strategy                                   │
│  └── bcrypt password hashing (10 rounds)                        │
│                                                                 │
│  Layer 6: AUTHORIZATION                                         │
│  └── Role-based access control (RBAC)                           │
│                                                                 │
│  Layer 7: DATA PROTECTION                                       │
│  ├── Private fields (toJSON plugin)                             │
│  └── Sensitive data exclusion from responses                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 1. Password Security (bcrypt)

```javascript
// user.model.js
userSchema.pre('save', async function (save) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};
```

**How bcrypt works:**
- Password: "myPassword123"
- Salt rounds: 10 (2^10 = 1024 iterations)
- Stored: "$2b$10$N9qo8uLOickgx2ZMRZoMy..."
- Even if database is stolen, passwords can't be reversed

## 2. JWT Authentication

```javascript
// Token structure
{
  "sub": "user_id_here",      // Subject (user ID)
  "iat": 1704067200,          // Issued at
  "exp": 1704069000,          // Expires at
  "type": "access"            // Token type
}

// Token expiration
Access Token:  30 minutes
Refresh Token: 30 days
```

**Authentication Flow:**
```
1. User logs in with email/password
2. Server validates credentials
3. Server generates access + refresh tokens
4. Client stores tokens
5. Client sends access token in Authorization header
6. Server validates token on each request
7. When access token expires, use refresh token to get new one
```

## 3. HTTP Security Headers (Helmet)

```javascript
app.use(helmet());

// Sets these headers:
Content-Security-Policy: default-src 'self'
X-DNS-Prefetch-Control: off
X-Frame-Options: SAMEORIGIN          // Prevents clickjacking
X-Content-Type-Options: nosniff      // Prevents MIME sniffing
X-XSS-Protection: 1; mode=block      // XSS filter
Referrer-Policy: no-referrer
```

## 4. XSS Protection

```javascript
app.use(xss());

// Sanitizes input:
// Before: "<script>alert('xss')</script>"
// After:  "&lt;script&gt;alert('xss')&lt;/script&gt;"
```

## 5. NoSQL Injection Prevention

```javascript
app.use(mongoSanitize());

// Prevents attacks like:
// { "email": { "$gt": "" } }  // Would match all users
// Sanitized to safe string
```

## 6. Rate Limiting

```javascript
// rateLimiter.js
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 20,                      // 20 requests max
  skipSuccessfulRequests: true, // Only count failures
});

// Applied to auth routes in production
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}
```

## 7. Input Validation (Joi)

```javascript
// auth.validation.js
const login = {
  body: Joi.object().keys({
    identifier: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

// validate.js middleware
const validate = (schema) => (req, res, next) => {
  const { error } = Joi.compile(schema).validate(req);
  if (error) {
    return next(new ApiError(400, errorMessage));
  }
  next();
};
```

## 8. Private Fields Protection

```javascript
// farmer.model.js
accountNumber: {
    type: String,
    private: true,  // Marked as private
},

// toJSON.plugin.js - Automatically removes private fields
const transform = (doc, ret) => {
  Object.keys(schema.paths).forEach((path) => {
    if (schema.paths[path].options.private) {
      delete ret[path];  // Removed from API response
    }
  });
};
```

## 9. CORS Configuration

```javascript
app.use(cors());
app.options('*', cors());

// In production, would be restricted:
app.use(cors({
  origin: 'https://shetisetu.gov.in',
  credentials: true
}));
```

## 10. File Upload Security

```javascript
// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'), false);
    }
  },
});

// Sharp - Image processing
sharp(buffer)
  .resize(1200, 1200, { fit: 'inside' })
  .jpeg({ quality: 80 })
  .toFile(outputPath);
```

---

# 8. Environment Configuration

## .env File Explained

```env
# =========================
# Server Configuration
# =========================
PORT=3000                    # Server port
NODE_ENV=development         # Environment mode

# =========================
# MongoDB Configuration
# =========================
MONGODB_URL=mongodb://127.0.0.1:27017/major_project

# =========================
# JWT Configuration
# =========================
JWT_SECRET=MajorProject@2026!SecureKey  # Secret for signing tokens

JWT_ACCESS_EXPIRATION_MINUTES=30        # Access token: 30 min
JWT_REFRESH_EXPIRATION_DAYS=30          # Refresh token: 30 days
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10

# =========================
# Email Configuration
# =========================
SMTP_HOST=smtp.ethereal.email    # Email server
SMTP_PORT=587                    # TLS port
SMTP_USERNAME=user@ethereal.email
SMTP_PASSWORD=password123
EMAIL_FROM=noreply@shetisetu.com

# =========================
# ML Service
# =========================
ML_SERVICE_URL=http://localhost:5000/api/v1
```

## Config Validation

```javascript
// config.js - Joi validates all env vars at startup
const envVarsSchema = Joi.object().keys({
  NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
  PORT: Joi.number().default(3000),
  MONGODB_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  // ...
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}
```

---

# 9. ML Service

## Overview

The ML Service provides AI-powered predictions for:
1. **Crop Recommendations** - Based on soil, climate, season
2. **Yield Prediction** - Expected harvest quantity
3. **Loss Assessment** - Damage estimation from photos

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     ML SERVICE (Flask)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  POST /api/v1/predict/crop                                      │
│  ├── Input: soil_type, district, season, rainfall              │
│  └── Output: recommended_crops[], confidence_scores[]           │
│                                                                 │
│  POST /api/v1/predict/yield                                     │
│  ├── Input: crop, area, season, irrigation_type                │
│  └── Output: expected_yield, confidence                         │
│                                                                 │
│  POST /api/v1/predict/loss                                      │
│  ├── Input: image_url, crop_type                               │
│  └── Output: damage_percentage, damage_type                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Integration with Backend

```javascript
// prediction.service.js
const axios = require('axios');
const config = require('../config/config');

const getCropRecommendation = async (data) => {
  const response = await axios.post(
    `${config.mlServiceUrl}/predict/crop`,
    data
  );
  return response.data;
};
```

---

# 10. Interview Q&A

## General Questions

**Q: What is ShetiSetu?**
> A digital governance platform for Maharashtra farmers that digitizes crop surveys, loss reporting, and compensation tracking. The name means "Agricultural Bridge" - bridging farmers with government services.

**Q: What problem does it solve?**
> It replaces paper-based manual processes with digital workflows, reducing delays, errors, and corruption in agricultural governance. Farmers can track their claims transparently.

**Q: Why did you choose this tech stack?**
> - React: Component-based UI, large ecosystem, good for complex forms
> - Node.js: JavaScript full-stack, non-blocking I/O for concurrent requests
> - MongoDB: Flexible schema for varied agricultural data, good with Node.js
> - JWT: Stateless authentication, scalable for mobile/web clients

## Frontend Questions

**Q: How does authentication work in the frontend?**
> On successful login, JWT tokens are stored in localStorage. The access token is sent in Authorization header for API calls. When it expires, we use the refresh token to get a new access token without re-login.

**Q: How do you handle form validation?**
> We use Formik for form state management and Yup for validation schemas. Validation runs on blur and submit. Server-side validation with Joi provides additional security.

**Q: How does role-based routing work?**
> The HomeRedirect component checks user role from localStorage and redirects to the appropriate dashboard. Protected routes are wrapped in Layout component that verifies authentication.

## Backend Questions

**Q: Explain your API architecture.**
> We follow a layered architecture: Routes define endpoints and apply middlewares, Controllers handle HTTP request/response, Services contain business logic, Models interact with database. This separation makes code maintainable and testable.

**Q: How do you handle authentication?**
> Using Passport.js with JWT strategy. When a request comes, the auth middleware extracts the token from Authorization header, verifies it using JWT_SECRET, and attaches the user to the request object.

**Q: How does RBAC work?**
> Each role has a list of permissions. The auth middleware accepts required permission as parameter. It checks if the authenticated user's role includes that permission. If not, returns 403 Forbidden.

## Security Questions

**Q: How do you protect against brute force attacks?**
> Rate limiting using express-rate-limit. Authentication endpoints allow max 20 failed requests per 15-minute window. The `skipSuccessfulRequests` option means legitimate users aren't affected.

**Q: How are passwords stored?**
> Passwords are hashed using bcrypt with 10 salt rounds before storing. The original password is never stored. On login, we compare the hash of provided password with stored hash.

**Q: How do you prevent SQL/NoSQL injection?**
> Using mongo-sanitize middleware that removes any keys starting with '$' from user input. Also, Mongoose parameterized queries prevent injection attacks.

**Q: How is sensitive data protected?**
> Sensitive fields like bank account numbers are marked with `private: true` in the schema. Our toJSON plugin automatically strips these fields before sending API responses.

## Database Questions

**Q: Why MongoDB over SQL?**
> Agricultural data has varying structures (different crops, land types, damage types). MongoDB's flexible schema handles this well. Also, document model maps naturally to JSON API responses.

**Q: Explain your data model relationships.**
> User has Farmer profile (1:1). Farmer has many CropSurveys (1:N). CropSurvey has many LossReports (1:N). LossReport has one Panchanama (1:1). We use Mongoose references and populate for queries.

## Deployment Questions

**Q: How would you deploy this in production?**
> - Frontend: Build with Vite, deploy to CDN (Vercel/Netlify)
> - Backend: Containerize with Docker, deploy to cloud (AWS/Azure)
> - Database: MongoDB Atlas for managed hosting
> - ML Service: Container on cloud with GPU if needed

**Q: How do you handle environment variables in production?**
> Never commit .env files. Use platform-specific env var settings (Heroku Config Vars, AWS Parameter Store) or secret managers (HashiCorp Vault, AWS Secrets Manager).

---

## Quick Reference Card

### API Base URL
```
Development: http://localhost:3000/v1
Production:  https://api.shetisetu.gov.in/v1
```

### Authentication Header
```
Authorization: Bearer <access_token>
```

### Common HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

### User Roles & Permissions
| Role | Key Permissions |
|------|-----------------|
| farmer | Submit surveys, Report losses |
| officer | Verify surveys, Conduct panchanama |
| authority | Review panchanama, Approve compensation |
| admin | Manage all users and system |

---

**Good luck with your interview!** 🌾

*Document generated for ShetiSetu Major Project*
