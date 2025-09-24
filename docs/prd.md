# Product Requirements Document (PRD)

## What to Build

### 1. User Stories & Acceptance Criteria

#### Emergency Flow (Critical Priority)
- **GPS-Based Emergency Search**
  - *User Story*: As an emergency user, I want to instantly find the nearest judicial officers so I can get immediate legal assistance.
  - *Acceptance Criteria*:
    - User can grant location permission.
    - App displays 3 nearest verified huissiers within 5 seconds.
    - Contact info (call/WhatsApp/email) is visible and actionable.

- **One-Tap Contact**
  - *User Story*: As an emergency user, I want to immediately call or message a huissier so I can get help without delay.
  - *Acceptance Criteria*:
    - Contact buttons are prominent and functional.
    - Call, WhatsApp, and email actions work reliably.
    - User receives feedback if contact fails.

- **Location Permission Flow**
  - *User Story*: As a user, I want a clear explanation for location access so I feel secure sharing my location.
  - *Acceptance Criteria*:
    - Permission prompt includes privacy explanation.
    - User can deny and use manual search instead.

#### Huissier Management (High Priority)
- **Profile Creation/Claim**
  - *User Story*: As a huissier, I want to create or claim my professional profile so I can be found by clients and manage my subscription.
  - *Acceptance Criteria*:
    - Signup and claim flow is available.
    - Profile fields include name, contact, specialties, credentials.
    - Admin verification for claimed profiles.

- **Verification System**
  - *User Story*: As a huissier, I want to verify my credentials so users trust my services.
  - *Acceptance Criteria*:
    - Verification badge shown on profile after admin approval.
    - Document upload and review process.

- **Request Management**
  - *User Story*: As a huissier, I want to manage and respond to client requests so I can organize my work efficiently.
  - *Acceptance Criteria*:
    - Dashboard lists incoming requests.
    - Status updates and communication log available.

#### User Search & Discovery (High Priority)
- **City-Based Search**
  - *User Story*: As a user, I want to search for huissiers by city so I can find help without sharing location.
  - *Acceptance Criteria*:
    - City selector and filters are available.
    - Results update based on selection.

- **Filters & Sorting**
  - *User Story*: As a user, I want to filter huissiers by specialty and availability so I can find the right professional.
  - *Acceptance Criteria*:
    - Specialty and availability filters work.
    - Sorting by distance, rating, or verification status.

#### Communication (High Priority)
- **WhatsApp Integration**
  - *User Story*: As a user, I want to contact huissiers via WhatsApp so I can communicate conveniently.
  - *Acceptance Criteria*:
    - WhatsApp contact button opens chat with huissier.
    - Number is pre-filled and verified.

- **Request Tracking**
  - *User Story*: As a user, I want to track the status of my requests so I know what's happening.
  - *Acceptance Criteria*:
    - Request status visible in user dashboard.
    - Notifications for status changes.

#### Profile Management (Medium Priority)
- **Working Hours**
  - *User Story*: As a huissier, I want to set my working hours so clients know my availability.
  - *Acceptance Criteria*:
    - Working hours editable in profile.
    - Displayed on public profile.

- **Service Areas**
  - *User Story*: As a huissier, I want to define my service areas so I receive relevant requests.
  - *Acceptance Criteria*:
    - Service area selection in profile.
    - Requests filtered by area.

#### Payments & Premium (Medium Priority)
- **Subscription Management**
  - *User Story*: As a huissier, I want to manage my premium subscription so I can access advanced features.
  - *Acceptance Criteria*:
    - Subscription status and payment options available.
    - Access to premium features gated by subscription.

- **Featured Listings**
  - *User Story*: As a huissier, I want to promote my services so I can reach more clients.
  - *Acceptance Criteria*:
    - Featured listing option in dashboard.
    - Promoted profiles appear at top of search results.

#### Trust & Safety (High Priority)
- **Report System**
  - *User Story*: As a user, I want to report issues so the platform remains safe and professional.
  - *Acceptance Criteria*:
    - Report button on profiles and requests.
    - Admin review and resolution workflow.

- **Review System**
  - *User Story*: As a user, I want to review huissier services so others can benefit from my experience.
  - *Acceptance Criteria*:
    - Review submission after completed request.
    - Moderation and verification of reviews.

---

### 2. Feature Specifications
- GPS-based emergency search (with fallback to manual city search)
- Verified huissier profiles with badges
- Direct contact options: call, WhatsApp, email
- Profile claim and verification workflow
- Request management dashboard for huissiers
- City and specialty filters for users
- Review and report system
- Subscription and featured listing management
- Bilingual interface (Arabic/French/English)
- Offline mode for recent searches and static data
- Push notifications for request status and updates
- Responsive, mobile-first design with RTL support

---

### 3. Business Requirements
- Monetization via huissier subscriptions and featured listings
- Integration with Moroccan payment gateway (CMI)
- Compliance with Moroccan legal and privacy regulations
- Data security and user privacy standards
- Support for multi-language and accessibility
- Scalable architecture for regional/national expansion

### 3.1 Technical Stack Requirements
- **Core Technology**:
  - Frontend & Backend: Next.js 15
  - Language: TypeScript
  - Database: Supabase
  - PWA Support: @serwist/next

- **UI & Styling**:
  - Framework: TailwindCSS v4.x
  - Components: shadcn/ui
  - Icons & Animation: lucide-react, embla-carousel-react, framer-motion, vaul

- **State & Data Management**:
  - State Management: zustand
  - Forms: react-hook-form with @hookform/resolvers
  - Data Fetching: @tanstack/react-query

- **Features & Integration**:
  - Authentication: Supabase Auth (email, phone, Google)
  - File Storage: Supabase storage
  - Push Notifications: web-push ^3.6.7
  - Payments: CMI integration (mockup for MVP)

- **Development & Deployment**:
  - Linting: ESLint ^9, Prettier
  - Testing: Jest, React Testing Library (≥85% coverage)
  - Deployment: Vercel (primary), Supabase (DB/API)
  - Monitoring: Vercel Analytics, Supabase logs

- **Utilities**:
  - Development: clsx, class-variance-authority, tailwind-merge
  - UX Enhancement: use-debounce, input-otp, date-fns, cmdk

---

### 4. UI/UX Descriptions
- **Emergency Flow**: Large, prominent CTA in Arabic ("طلب مفوض قضائي") on home screen. Geolocation prompt appears on first use. Results show 3 nearest huissiers with distance, contact info, and office hours. One-tap contact buttons for call, WhatsApp, and email. Loading and error states clearly indicated.

- **Manual Search**: City/region selector at top. Filters for specialty, verification status, and availability. List view of huissiers with profile cards showing name, specialty, verification badge, and contact options. Simple navigation and clear feedback for empty states.

- **Huissier Dashboard**: Sidebar navigation for profile management, request management, analytics, and subscription. Profile editing form with fields for personal info, specialties, service areas, working hours, and document upload. Request list with status indicators and communication log. Analytics section with profile views and client satisfaction metrics.

- **General UI/UX**: Bilingual toggle (Arabic/French/English) in header. Responsive layouts for mobile and desktop. RTL support for Arabic. Accessible color contrast and touch-friendly controls. Clear separation between emergency and routine flows. Trust indicators (badges, verified reviews) visible throughout.

---

### 5. Success Metrics
- Search latency ≤5s (95th percentile)
- User journey: contact action completed within ≤2min from app open
- ≥20% of official huissier registry listed in pilot city within 6 months
- Visitor satisfaction ≥4.0/5 (email-based feedback)
- Profile completion rate for huissiers ≥60%
- Monthly Recurring Revenue (MRR) growth ≥25% month-over-month
- Platform uptime ≥99.5% during business hours
- Security incident rate: zero critical incidents
- Rural area coverage ≥30% of total usage
- Emergency service success rate ≥98%
