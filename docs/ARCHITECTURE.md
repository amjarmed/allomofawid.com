# Architecture Document

## How to Build


### 1. Tech Stack & Versions

- **Frontend**: Next.js 15
- **Backend**: Next.js 15 API routes
- **Language**: TypeScript
- **Styling**: TailwindCSS v4.x
- **UI Components**: shadcn/ui
- **Icons/Animation**: lucide-react, embla-carousel-react, framer-motion, vaul
- **PWA**: @serwist/next
- **State Management**: zustand
- **Forms**: react-hook-form
- **Data Fetching**: @tanstack/react-query
- **Form Validation**: @hookform/resolvers
- **Database**: Supabase
- **Authentication**: Supabase Auth (email, phone, Google provider)
- **Storage**: Supabase storage (if needed)
- **Push Notifications**: web-push ^3.6.7
- **Payments**: CMI (Centre Monétique Interbancaire) integration (mockup for MVP)
- **Utilities**: clsx, class-variance-authority, tailwind-merge, use-debounce, input-otp, date-fns, cmdk
- **Linting/Formatting**: ESLint ^9, Prettier
- **Testing**: Jest, React Testing Library with next-intl integration (target: ≥85% coverage)
- **Deployment**: Vercel (primary), Supabase (DB/API)
- **Monitoring**: Vercel Analytics, Supabase logs

### 2. Folder Structure & Conventions
```
src/
├── app/
│   ├── [locale]/           # Internationalized routes
│   │   ├── (auth)/        # Route groups
│   │   └── dashboard/     # Feature routes
│   └── api/               # API routes (prefer Edge runtime)
├── components/
│   ├── server/            # Default: no 'use client'
│   ├── client/            # Explicit: 'use client' directive
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── validations/       # Zod schemas by feature
│   ├── supabase/          # Client configurations
│   └── types/             # TypeScript definitions
└── messages/              # i18n translations (ar, fr, en)
public/                    # Static assets (images, icons, manifest)
docs/                      # Documentation (PRD, architecture, schema)
supabase/                  # DB config, migrations, RLS policies
```
- Use PascalCase for components, camelCase for functions/variables, UPPER_SNAKE_CASE for constants.
- Keep business logic in `lib/` and API logic in `api/`.
- Use TypeScript throughout for type safety.

### 3. Code Patterns & Standards
State Management:
  - Use Zustand for complex client-side state
  - Use React Hook Form + Zod for form state and validation
  - Use nuqs for URL state management
Internationalization:
  - Arabic-first, RTL by default
  - Use next-intl for i18n
  - Dynamic direction: <html dir={locale === 'ar' ? 'rtl' : 'ltr'}>
  - Translation patterns: always use t() for strings
Use environment variables for secrets/config
All API calls typed and validated

UI/UX Standards:
  - Compound component pattern for forms and UI
  - Tailwind mobile-first responsive design
  - Loading & error states: Suspense boundaries, skeletons, error boundaries
  - Accessibility: semantic HTML, ARIA attributes, color contrast
  - Trust indicators and one-tap actions for user confidence

### 4. API Design Principles
- RESTful API routes (Next.js API, `/api/*`)
- Use Supabase client for DB access (server-side only)
- Secure endpoints with Supabase Auth (JWT/session)
- Input validation: Always use Zod validation for all user input
- RLS First: Every table query must respect Row Level Security
- Never use service role client-side
- User isolation: Huissiers see only their data, users see only their requests
- Rate limiting for sensitive endpoints
- Consistent error responses (JSON, status codes)
- Pagination for list endpoints

### 5. Database Schema
- **Keep all tables and types as defined in `database_schema.md`**
- If any schema changes are needed, document them here before implementation.
- Use Supabase migrations for schema updates.
- RLS enabled for all tables except spatial_ref_sys.
- Use PostGIS for geolocation queries (find_nearest_huissiers).
- ENUM types for status/verification fields.
- JSONB for flexible fields (working_hours, permissions).

### 6. Deployment Strategy
-
## 🚫 Never Do

- Use localStorage/sessionStorage (not supported in RSC/artifacts)
- Skip Zod validation on any user input
- Hardcode Arabic/French/English strings (always use t())
- Use any type without explicit // @ts-expect-error comment
- Bypass RLS policies with service role on client-side
- Mix Server/Client Components in same file
- Use deprecated @next/font (use next/font)
- **Frontend**: Deploy to Vercel (auto CI/CD from GitHub)
- **Backend/DB**: Supabase project (managed Postgres, Auth, Storage)
- **Environment Variables**: Managed via Vercel and Supabase dashboard
- **Static Assets**: Served from `public/` directory
- **PWA**: Service Worker auto-generated via Serwist, offline support enabled
- **Monitoring**: Vercel Analytics, Supabase logs, error tracking
- **Scaling**: Supabase for DB, Vercel for frontend (auto-scaling)
- **Backup**: Supabase automated backups
- **Security**: HTTPS enforced, RLS, JWT, regular audits

---

**Note:**
- Database schema is up-to-date and should not be changed unless new features require it. Any changes must be documented in this file before implementation.
- All architecture decisions align with Next.js 15, Supabase, and PWA best practices for speed, reliability, and scalability.
