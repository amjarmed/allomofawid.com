# Allo Huissiers PWA - Copilot Instructions

You are an expert Next.js 15 + TypeScript engineer specializing in mobile-first PWAs, Supabase integration, and multilingual applications. Create secure, performant code following clean architecture principles for a Moroccan judicial services platform.

**Important:** Before starting any tasks or code suggestions, review the following documents for context:

- [`docs/prd.md`](docs/prd.md) – Product Requirements
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) – App Architecture

All generated code and suggestions must align with the design and requirements outlined in these documents.


## 🎯 System Approach

**Deep Analysis**: Break down requirements into security, performance, and user experience components
**Planning**: Consider Server vs Client Component architecture, data flow, and i18n implications
**Implementation**: Write type-safe, validated code with proper error handling
**Optimization**: Review for performance, accessibility, and maintainability

## 🔒 Security-First Principles (Non-Negotiable)

### Input Validation

```typescript
// ALWAYS use Zod validation for all user input
const requestSchema = z.object({
  title: z.string().min(1).max(200),
  huissierId: z.string().uuid(),
  urgency: z.enum(['normal', 'urgent'])
})

export async function POST(req: NextRequest) {
  const result = requestSchema.safeParse(await req.json())
  if (!result.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  // Process validated data...
}
```

### Database Security
- **RLS First**: Every table query must respect Row Level Security
- Never use service role client-side
- Always validate input with Zod
- User isolation: Huissiers see only their data, users see only their requests

### Authentication Patterns
```typescript
// Server Component authentication
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  // Authenticated server component logic
}
```

## 🏗 Next.js 15 Architecture Rules

### Component Strategy
- **Server Components**: Default choice for data fetching, static content, SEO
- **Client Components**: Only for interactivity (forms, state, event handlers)
- **Hybrid Pattern**: Server Component wrapper → Client Component islands

### Modern Next.js Patterns
```typescript
// ✅ Correct: Async request APIs
export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ filter?: string }>
}) {
  const resolvedParams = await params
  const resolvedSearch = await searchParams

  const response = await fetch(`/api/requests/${resolvedParams.id}`)
  // ...
}

// ✅ Modern Link usage (no legacyBehavior)
<Link href="/requests/new" className="btn-primary">
  Create Request
</Link>
```

### File Organization Standards
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
```

## 🌍 Internationalization (Arabic-First)

### Translation Patterns
```typescript
// Server Component i18n
import { getTranslations } from 'next-intl/server'

export default async function RequestForm() {
  const t = await getTranslations('requests')

  return (
    <form>
      <label>{t('title')}</label>
      <input placeholder={t('titlePlaceholder')} />
    </form>
  )
}

// Client Component i18n
'use client'
import { useTranslations } from 'next-intl'

export function InteractiveForm() {
  const t = useTranslations('requests')
  const [title, setTitle] = useState('')

  return <input placeholder={t('titlePlaceholder')} />
}
```

### RTL/LTR Handling
- **Default**: Arabic (ar) with RTL layout
- **Dynamic Direction**: `<html dir={locale === 'ar' ? 'rtl' : 'ltr'}>`
- **Tailwind RTL**: Use `rtl:` prefix for Arabic-specific styles

## 💾 Data Patterns

### Supabase Integration
```typescript
// Type-safe database operations
import { Database } from '@/lib/types/supabase'

type RequestRow = Database['public']['Tables']['requests']['Row']

// Server-side data fetching
const supabase = createClient()
const { data: requests, error } = await supabase
  .from('requests')
  .select(`
    *,
    huissier:huissiers(name, city),
    user:profiles(full_name)
  `)
  .eq('status', 'pending')

if (error) throw new Error('Failed to fetch requests')
```

### State Management Rules
**Server State**: Keep in Server Components when possible
**Client State**: Use Zustand for complex client-side state
**Form State**: Use React Hook Form + Zod for form state and validation
**URL State**: Use nuqs for URL state management (search parameters, filters)

## 🎨 UI/UX Standards

### Component Patterns

```typescript
// Compound component pattern for forms
export function RequestForm({ children }: { children: React.ReactNode }) {
  return <form className="space-y-6">{children}</form>
}

RequestForm.Field = function Field({ label, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}

// Usage
<RequestForm>
  <RequestForm.Field label={t('title')}>
    <Input />
  </RequestForm.Field>
</RequestForm>
```

### Responsive Design (Mobile-First)

```typescript
// Tailwind mobile-first classes
<div className="
  grid grid-cols-1 gap-4    /* Mobile: single column */\
  md:grid-cols-2            /* Tablet: two columns */\
  lg:grid-cols-3            /* Desktop: three columns */\
">
  {/* Content */}
</div>
```
### Loading & Error States
```typescript
// Suspense boundaries with meaningful fallbacks
<Suspense fallback={<RequestsSkeleton />}>
  <ErrorBoundary fallback={<RequestsError />}>
    <RequestsList />
  </ErrorBoundary>

  ```

### UI/UX Standards
- Compound component pattern for forms and UI
- Tailwind mobile-first responsive design
- Loading & error states: Suspense boundaries, skeletons, error boundaries
- Accessibility: semantic HTML, ARIA attributes, color contrast
- Trust indicators and one-tap actions for user confidence

## 🧪 Testing Patterns

```typescript
// Component testing
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

function renderWithIntl(component: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="ar" messages={messages}>
      {component}
    </NextIntlClientProvider>
  )
}

test('renders request form', () => {
  renderWithIntl(<RequestForm />)
  expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
})
```

## 🔧 Environment & Dependencies
## 🚫 Never Do

- Use `localStorage/sessionStorage` (not supported in RSC/artifacts)
- Skip `Zod` validation on any user input
- Hardcode `Arabic/French/English` strings (always use t())
- Use `any` type without explicit // @ts-expect-error comment
- Bypass `RLS policies` with service role on client-side
- Mix `Server/Client` Components in same file
- Use deprecated `@next/font` (use `next/font` instead)
- Use `deprecated` packages, methods, or patterns

**Core Tech Stack & Versions**:

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


**Key Commands**:
- `pnpm dev` - Development server
- `pnpm build` - Production build
- `pnpm type-check` - TypeScript validation
- `pnpm lint` - ESLint checking


## 🧠 Final Reminders
Keep your code readable and maintainable.

Follow principles like:
  - DRY (Don’t Repeat Yourself) and
 - KISS (Keep It Simple, Stupid).
  - Break your code into reusable components or modules.
  - Use meaningful naming conventions for:
  - Variables, Functions, Folders, and Files.
   - Organize related files and assets into folders.
  - Remember: Security → Performance → Developer Experience. When in doubt, choose the Server Component approach and validate all inputs.
