🌾 ShetiSetu

Product Vision · Product Roadmap · Feature-wise Detailed PRD

1️⃣ PRODUCT VISION
Product Name

ShetiSetu – A Digital Bridge Between Farmers and Agricultural Officers

Vision Statement

To build a transparent, end-to-end digital governance platform that ensures accurate crop surveys, verifiable crop loss assessment, timely compensation, and full visibility for farmers, officers, and higher authorities.

Core Vision

ShetiSetu aims to eliminate uncertainty, delays, and opacity from the crop loss and compensation process by creating a single digital case file per farmer, tracked from crop sowing → loss reporting → verification → compensation → grievance resolution.

What Success Looks Like

A farmer never has to ask “what happened to my application?”

An officer never has to manage cases via paper, WhatsApp, or Excel

Authorities can see real-time damage data and compensation impact

Every decision is data-backed, auditable, and traceable

Design Principles

Farmer-first, not officer-first

Evidence-driven workflows

Mobile-first & low-literacy friendly

Language & voice accessibility

Audit-ready by default

2️⃣ PRODUCT ROADMAP
Phase 1 — Core Digital Foundation (MVP)

Goal: Digitize crop survey + loss reporting + visibility

Key Deliverables

Farmer authentication & profile

Digital Crop Survey (E-Pik Pahani)

Crop Loss Reporting

Geo-tagged photo uploads

Notifications & basic dashboard

Users Impacted

Farmers

Field Officers (limited)

Phase 2 — Verification & Compensation Workflow

Goal: Replace manual verification & Panchanama

Key Deliverables

e-KYC & document verification

Officer dashboards

Digital e-Panchanama

Compensation estimation

Approval & rejection workflows

Users Impacted

Farmers

Agriculture Officers

Phase 3 — Governance & Analytics

Goal: Enable district/state-level oversight

Key Deliverables

Higher authority dashboards

Heatmaps & trend analytics

Officer performance tracking

Audit & compliance tools

Exportable reports

Users Impacted

Taluka / District / State officers

Phase 4 — Accessibility & Intelligence

Goal: Inclusion + decision intelligence

Key Deliverables

Multilingual UI

Voice assistant

Scheme recommendations

Risk zone identification

Policy planning insights

3️⃣ FEATURE-WISE DETAILED PRD
Feature 1: User Authentication & Role Management
Objective

Enable secure, role-based access for Farmers, Officers, and Authorities.

Users

Farmer

Agriculture Officer

Higher Authority

Functional Requirements

Mobile/Aadhaar based registration (farmer)

Secure login with password

Automatic role detection

JWT-based session handling

Language selection at login

Non-Functional

OTP support (future)

Password encryption

Role-based route access

Feature 2: Farmer Profile & Land Mapping
Objective

Create a single verified identity for each farmer.

Data Captured

Personal details

Village hierarchy (Division → District → Taluka → Village)

Bank details

Land parcels (7/12 linked)

Functional Requirements

View & edit profile

Auto-link land records

Read-only Aadhaar & mobile

Multiple land parcels per farmer

Feature 3: Digital Crop Survey (E-Pik Pahani)
Objective

Digitize crop declaration with proof.

Functional Requirements

Season selection (Kharif, Rabi, Perennial)

Crop type, variety, seed type

Sowing & harvest dates

Irrigation type

Cultivated area

Geo-tagged crop images

GPS capture

Business Rules

Only owned/leased land allowed

Mandatory image upload

One active crop per land per season

Feature 4: Crop Loss Reporting
Objective

Enable structured, evidence-backed loss reporting.

Functional Requirements

Loss reason selection

Severity level

Affected area entry

Damage photo upload

Auto link to crop survey

Validation Rules

Loss area ≤ cultivated area

Mandatory geo-tagged photos

One loss report per survey per event

Feature 5: e-KYC & Document Management
Objective

Ensure identity, land, and bank verification.

Documents

Aadhaar

7/12 extract

Bank passbook / IFSC proof

Lease agreement (if applicable)

Functional Requirements

Upload & re-upload

Officer verification status

Missing document alerts

Remarks visible to farmer

Feature 6: Digital e-Panchanama
Objective

Replace paper-based field inspection.

Panchanama Data

Case ID

Land & crop details

Loss percentage

Affected area

Cause of damage

Geo-coordinates

Photos

Officer remarks

Digital signature

Functional Requirements

Field visit scheduling

On-site data capture

Save & submit Panchanama

Auto-notify farmer

Feature 7: Compensation Estimation & Approval
Objective

Ensure rule-based, transparent compensation.

Functional Requirements

Auto compensation calculation

Scheme mapping (PMFBY / SDRF / State)

Approval / rejection flow

Mandatory rejection reason

Payment status tracking

Status Flow
Submitted → Under Verification → Approved → Paid

Feature 8: Notifications & Tracking
Objective

Keep farmers informed at every step.

Notifications Triggered On

Submission

Missing documents

Field visit scheduled

Approval / rejection

Payment credited

Channels

In-app notifications

(SMS future scope)

Feature 9: Officer Dashboard & Task Management
Objective

Improve efficiency and accountability.

Dashboard Views

Pending cases

Scheduled visits

Completed cases

Rejected cases

Daily workload

Feature 10: Higher Authority Analytics & Governance
Objective

Enable data-driven decisions.

Analytics

Total surveys

Loss distribution

Compensation disbursed

District & taluka heatmaps

Officer performance

Governance Tools

Random audits

Anomaly detection

Export reports (PDF/Excel)

Feature 11: Accessibility & Inclusion
Objective

Ensure adoption across literacy levels.

Functional Requirements

Marathi, Hindi, English UI

Voice-guided navigation

Simple step-by-step flows

Large buttons & minimal text

✅ Final Outcome

ShetiSetu is not just a farmer app, but a state-level digital infrastructure for:

Agricultural transparency

Faster relief delivery

Policy intelligence

Trust between farmers and government