# PaintBookCo Pages Styling Documentation

This document preserves the styling, layout classes, and component structure used in the Privacy Policy, Terms of Service, and About Us pages to maintain consistency after syncing with the main branch.

## Core Design System

### Color & Theme Variables (from global.css)
- **Primary Color**: `--primary: 18 88% 52%` (coral-orange)
- **Background**: `--background: 36 25% 97%` (warm cream light) | Dark: `220 18% 7%`
- **Foreground**: `--foreground: 220 18% 9%` (near-black) | Dark: `36 20% 93%`
- **Section Dark**: `--section-dark-bg: 220 18% 9%` | `--section-dark-fg: 36 20% 93%`
- **Muted**: `--muted: 36 15% 93%` | `--muted-foreground: 220 10% 48%`
- **Border**: `--border: 36 12% 88%`

### Typography
- **Display/Headings**: DM Serif Display (Georgia fallback)
  - h1: `text-4xl sm:text-5xl lg:text-6xl font-normal tracking-[-0.02em] leading-[1.05]`
  - h2: `text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[-0.02em] leading-[1.1]`
  - h3: `text-2xl sm:text-3xl font-normal tracking-[-0.01em] leading-[1.2]`
- **Body**: DM Sans (ui-sans-serif fallback)
  - p: `text-base leading-[1.7]`

## Page Layout Classes

### Container Classes
```tsx
// Max-width containers
.page-container = "mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-12"
.page-container-wide = "mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-16"
.page-container-narrow = "mx-auto w-full max-w-2xl px-6 sm:px-8"

// Spacing
.section-gap = "py-16 sm:py-20 lg:py-28"
.section-stack = "flex flex-col gap-8 sm:gap-12 lg:gap-16"
```

### Section Types
```tsx
// Light section (default background)
.section-light = "bg-background text-foreground"

// Dark section (navy background)
.section-dark = "background: hsl(var(--section-dark-bg)); color: hsl(var(--section-dark-fg))"

// Warm section (light neutral)
.section-warm = "background: hsl(36 25% 94%); text-foreground"
```

### Card Components
```tsx
// Standard card with hover effect
.surface-card = "rounded-sm border border-border/60 bg-card shadow-none
                transition-all duration-500
                hover:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1"

// Modern card variant
.card-modern = "rounded-sm border border-border/40 bg-card p-8
               transition-all duration-500
               hover:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1"
```

### Utility Classes
```tsx
// Labels (small caps)
.editorial-label = "text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground"

// Dividers
.section-divider = "h-px bg-border"
.editorial-rule = "h-px w-12 bg-foreground"

// Transitions
.transition-smooth = "transition-all duration-400 ease-out"
.transition-smooth-lg = "transition-all duration-600 ease-out"
.link-smooth = "transition-colors duration-300 hover:text-primary"
```

## Animation Classes

### Keyframe Animations (in global.css)
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes editorialUp {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes editorialDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes editorialLeft {
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes editorialRight {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}
```

### Animation Utility Classes
```tsx
.animate-fade-in = "animation: fadeIn 0.6s ease-out"
.animate-editorial-up = "animation: editorialUp 0.9s cubic-bezier(0.25, 0.1, 0.25, 1) both"
.animate-editorial-down = "animation: editorialDown 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) both"
.animate-editorial-left = "animation: editorialLeft 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) both"
.animate-editorial-right = "animation: editorialRight 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) both"
.animate-scale-in = "animation: scaleIn 0.7s cubic-bezier(0.25, 0.1, 0.25, 1) both"

// Stagger animation
.animate-stagger > * {
  opacity: 0;
  animation: editorialUp 0.9s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
}
.animate-stagger > *:nth-child(1) { animation-delay: 0.10s; }
.animate-stagger > *:nth-child(2) { animation-delay: 0.22s; }
// etc...
```

## Privacy Policy Page Structure

### Key Components
```tsx
// Header section
<div className="mb-12 animate-fade-in">
  <p className="editorial-label mb-4">Legal Document</p>
  <h1 className="mb-4">Privacy Policy</h1>
  <div className="space-y-2 text-muted-foreground">
    // Metadata
  </div>
</div>

// Info box
<div className="surface-card p-6 mb-12">
  <h2 className="text-2xl mb-4">Who We Are</h2>
  // Table content
</div>

// Main prose content
<article className="prose prose-slate dark:prose-invert max-w-none space-y-8">
  <section>
    <h2>Section Title</h2>
    // Content with ul, li, p tags
  </section>
</article>

// Data tables
<div className="overflow-x-auto mt-4">
  <table className="min-w-full border-collapse text-sm">
    <thead className="bg-muted">
      <tr>
        <th className="border border-border p-3 text-left font-semibold">Header</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="border border-border p-3">Cell</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Prose Classes Applied
- `prose prose-slate dark:prose-invert` - Tailwind prose styling
- `max-w-none` - Remove max-width constraint
- `space-y-8` - Add spacing between sections

## Terms of Service Page Structure

### Key Sections
```tsx
// Hero header with metadata
<div className="mb-12 animate-fade-in">
  <p className="editorial-label mb-4">Legal Document</p>
  <h1 className="mb-4">Terms of Service</h1>
</div>

// Plain English Summary Box
<div className="surface-card p-6 mb-12 bg-accent/50 border-2 border-primary/20">
  <h2 className="text-2xl mb-4">Plain English Summary</h2>
  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
    <li>Key point</li>
  </ul>
</div>

// Critical rule boxes (warnings)
<div className="surface-card p-6 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900/50 mb-6">
  <h3 className="text-lg font-bold mb-3 text-red-900 dark:text-red-100">Critical Title</h3>
  <p className="font-semibold text-red-900 dark:text-red-100 mb-2">Emphasis text</p>
  <ul className="list-disc list-inside space-y-1 text-sm text-red-800 dark:text-red-200">
    <li>Point</li>
  </ul>
</div>

// Yellow warning boxes
<div className="surface-card p-6 bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-200 dark:border-yellow-900/50 mb-6">
  <h3 className="text-xl font-bold mb-3 text-yellow-900 dark:text-yellow-100">Warning</h3>
  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
    <li>Point</li>
  </ul>
</div>

// Numbered lists
<ol className="list-decimal list-inside space-y-2">
  <li>Step one</li>
  <li>Step two</li>
</ol>
```

## About Us Page Structure

### Key Components
```tsx
// Hero section with gradient
<section className="relative overflow-hidden bg-background">
  <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
    <div className="animate-fade-in">
      <p className="editorial-label mb-4">About PaintBookCo</p>
      <h1 className="mb-6">Simplifying Paint. Empowering Painters.</h1>
      <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
        // Intro text
      </p>
    </div>
  </div>
</section>

// Grid sections (2 or 4 column)
<div className="grid gap-8 md:grid-cols-2">
  <div className="surface-card p-8">
    <icon className="h-8 w-8 text-primary mb-4" />
    <h3 className="text-xl font-semibold mb-3">Title</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">Description</p>
  </div>
</div>

// CTA section (dark background)
<section className="section-dark section-gap">
  <div className="mx-auto max-w-7xl px-6 lg:px-10">
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-white mb-6">Section Title</h2>
      <p className="text-white/70 mb-8 leading-relaxed">Description</p>
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        // Button groups
      </div>
    </div>
  </div>
</section>
```

### Grid Patterns Used
- `grid gap-8 md:grid-cols-2` - 2-column responsive
- `grid gap-8 md:grid-cols-2 lg:grid-cols-4` - 4-column responsive
- `grid gap-6 md:grid-cols-2` - Tighter spacing variant

## Common Component Patterns

### Buttons
```tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Primary button
<Button asChild>
  <Link to="/path">Button Text</Link>
</Button>

// Outline button
<Button asChild variant="outline">
  <Link to="/path">Button Text</Link>
</Button>

// Size variants
<Button asChild size="sm"><Link to="/path">Small</Link></Button>
<Button asChild size="lg"><Link to="/path">Large</Link></Button>
```

### Icons Used
- From lucide-react: `CheckCircle2`, `ShieldCheck`, `Users`, `Lock`, `Zap`, `Heart`
- Applied to cards: `className="h-8 w-8 text-primary mb-4"`

### Typography Combinations
```tsx
// Section label + heading
<p className="editorial-label mb-4">Category</p>
<h2 className="mb-6">Main Heading</h2>

// Card with emphasis
<div className="surface-card p-6">
  <h3 className="text-xl font-semibold mb-3">Title</h3>
  <p className="text-sm text-muted-foreground leading-relaxed">Description</p>
</div>

// Grid of features
<ul className="space-y-3">
  <li className="flex items-start gap-3 text-sm text-muted-foreground">
    <Icon className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
    <span>Feature text</span>
  </li>
</ul>
```

## Responsive Breakpoints Used

```tailwind
sm: 640px   - Small tablets
md: 768px   - Tablets
lg: 1024px  - Desktops
```

## Dark Mode Support

All components use Tailwind's dark mode classes:
```tsx
className="bg-background dark:bg-background"
className="text-foreground dark:text-foreground"
className="border border-border dark:border-border"
```

The color scheme automatically adjusts based on the system or user preference set in the design tokens.

## Import Structure

```typescript
// Components
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// React
import { Link } from "react-router-dom";

// Icons
import { 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Lock, 
  Zap, 
  Heart 
} from "lucide-react";
```

## Key Preservation Notes

✅ **Preserve these when syncing:**
1. All `surface-card` and styling classes in Privacy/Terms/About pages
2. Animation classes like `animate-fade-in`, `animate-editorial-up`
3. Section layout: `section-light`, `section-dark`, `section-warm`, `section-gap`
4. Typography: h1, h2, h3 with serif display font
5. Table styling with `border-collapse`, `text-sm`, and muted headers
6. Button patterns with `asChild` and Link routing
7. Grid patterns for responsive layouts
8. Dark mode support with color variables

⚠️ **Watch for conflicts during sync:**
- Any updates to global.css animation definitions
- Changes to Tailwind color configuration
- Updates to Button or Separator component APIs
- Typography/heading size changes

---

**Last Updated**: April 2026
**Pages Documented**: Privacy Policy, Terms of Service, About Us
**Framework**: React 18 + TypeScript + Tailwind CSS 3
