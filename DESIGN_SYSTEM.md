# PaintBookCo Design System — SECTION 1

## Overview

PaintBookCo uses a two-theme design system optimized for its two user types:
- **Customer Dashboard**: Orange/Amber accent (#F97316)
- **Painter Dashboard**: Blue accent (#3B82F6)

Both dashboards use dark backgrounds for a premium, professional feel.

---

## Color Themes

### Customer Dashboard Theme

```
Primary Background:     #0A0A0A   (deep black)
Card Background:        #1A1A1A   (dark gray)
Accent Color:          #F97316   (orange)
Text Primary:          #FFFFFF   (white)
Text Secondary:        #9CA3AF   (gray)
Success:               #22c55e   (green)
Warning:               #eab308   (amber)
Danger:                #ef4444   (red)
```

**CSS Classes:**
```css
.dashboard-customer          /* Wrapper class for customer dashboard */
.dashboard-customer-card     /* Card styling */
.dashboard-customer-accent   /* Accent text color */
.dashboard-customer-accent-bg /* Accent background with opacity */
.dashboard-customer-success  /* Success state styling */
.dashboard-customer-warning  /* Warning state styling */
.dashboard-customer-danger   /* Danger state styling */
```

**Usage Example:**
```tsx
<div className="dashboard-customer min-h-screen">
  <div className="dashboard-customer-card">
    <h2 className="dashboard-customer-accent">Active Jobs</h2>
  </div>
</div>
```

### Painter Dashboard Theme

```
Primary Background:     #0C0F1A   (deep navy-black)
Card Background:        #141824   (navy card)
Accent Color:          #3B82F6   (blue)
Text Primary:          #FFFFFF   (white)
Text Secondary:        #94A3B8   (slate gray)
Success:               #22c55e   (green)
Warning:               #3B82F6   (blue — matches accent)
Danger:                #ef4444   (red)
```

**CSS Classes:**
```css
.dashboard-painter          /* Wrapper class for painter dashboard */
.dashboard-painter-card     /* Card styling */
.dashboard-painter-accent   /* Accent text color */
.dashboard-painter-accent-bg /* Accent background with opacity */
.dashboard-painter-success  /* Success state styling */
.dashboard-painter-warning  /* Warning state styling */
.dashboard-painter-danger   /* Danger state styling */
```

**Usage Example:**
```tsx
<div className="dashboard-painter min-h-screen">
  <div className="dashboard-painter-card">
    <h2 className="dashboard-painter-accent">Available Jobs</h2>
  </div>
</div>
```

---

## Status Badges

### Complete Status Badge Set

Each status has its own badge styling:

```
.badge-pending           /* Gray — awaiting action */
.badge-matching          /* Blue pulse — actively matching */
.badge-accepted          /* Purple — painter accepted */
.badge-awaiting-payment  /* Amber — payment pending */
.badge-escrow-funded     /* Teal — escrow active */
.badge-in-progress       /* Blue — work in progress */
.badge-milestone-review  /* Orange — milestone under review */
.badge-pending-completion /* Green — awaiting customer confirmation */
.badge-completed         /* Green filled — job done */
.badge-disputed          /* Red — dispute raised */
.badge-cancelled         /* Gray strikethrough — cancelled */
```

**Usage Example:**
```tsx
<div className="flex gap-3">
  <span className="badge-in-progress">
    <Loader2 className="h-3 w-3 animate-spin" />
    In Progress
  </span>
  <span className="badge-matching">
    <Zap className="h-3 w-3" />
    Matching Painters
  </span>
</div>
```

**Status Badge Animation:**
```tsx
/* For active states requiring attention */
<span className="badge-matching">Active</span>  /* Built-in pulse */

/* For custom pulse animation */
<span className="status-pulse-fast">Loading...</span>
```

---

## Typography System

### Headings

```
h1  text-4xl sm:text-5xl lg:text-6xl    DM Serif Display
    tracking-[-0.02em] leading-[1.05]   Editorial feel

h2  text-3xl sm:text-4xl lg:text-5xl    DM Serif Display
    tracking-[-0.02em] leading-[1.1]

h3  text-2xl sm:text-3xl                DM Serif Display
    tracking-[-0.01em] leading-[1.2]

h4  text-lg font-semibold               DM Sans
    tracking-tight

h5  text-base font-semibold             DM Sans

h6  text-sm font-semibold uppercase     DM Sans
    tracking-widest
```

### Body Text

```
p   text-base leading-[1.7]             DM Sans
    Standard paragraph text

.text-serif                             DM Serif Display
    For editorial/marketing content

.text-display                           DM Serif Display
    For display typography
    font-normal tracking-[-0.02em]
    leading-[1.05]
```

---

## Animations & Transitions

### Editorial Animations (Homepage)

```css
.animate-fade-in          0.6s ease-out
.animate-editorial-up     0.9s cubic-bezier(0.25, 0.1, 0.25, 1)
.animate-editorial-down   0.8s cubic-bezier(0.25, 0.1, 0.25, 1)
.animate-editorial-left   0.8s cubic-bezier(0.25, 0.1, 0.25, 1)
.animate-editorial-right  0.8s cubic-bezier(0.25, 0.1, 0.25, 1)
.animate-clip-reveal      0.9s cubic-bezier(0.25, 0.1, 0.25, 1)
.animate-scale-in         0.7s cubic-bezier(0.25, 0.1, 0.25, 1)
```

### Stagger Animation (for lists)

```tsx
<div className="animate-stagger">
  <div>Item 1</div>  {/* delay: 0.10s */}
  <div>Item 2</div>  {/* delay: 0.22s */}
  <div>Item 3</div>  {/* delay: 0.34s */}
</div>
```

### Dashboard Card Transitions

```css
.transition-smooth        All properties, 400ms, ease-out
.transition-smooth-lg     All properties, 600ms, ease-out
.hover-lift               Translates on Y axis, adds shadow
.hover-lift-lg            Larger lift effect
.hover-scale              Scales to 1.03x on hover
```

**Usage Example:**
```tsx
<div className="dashboard-customer-card hover-lift">
  <h3>Job Status</h3>
</div>
```

---

## Layout Components

### Containers

```css
.page-container           max-w-6xl    Standard page width
.page-container-wide      max-w-7xl    Wide layouts (dashboards)
.page-container-narrow    max-w-2xl    Narrow layouts (forms)
.section-gap              py-28        Large section spacing
.section-stack            flex col     Vertical stacking with gaps
```

### Cards

```css
.surface-card             Standard card with hover shadow
.card-modern              Modern card with more padding
.dashboard-customer-card  Customer theme card
.dashboard-painter-card   Painter theme card
```

---

## Status Color Reference

### Job Status Progression

```
pending_match          → .badge-pending
matching_in_progress   → .badge-matching (with pulse)
painter_accepted       → .badge-accepted
awaiting_payment       → .badge-awaiting-payment
escrow_funded          → .badge-escrow-funded
in_progress            → .badge-in-progress
milestone_review       → .badge-milestone-review
pending_completion     → .badge-pending-completion
completed              → .badge-completed
disputed               → .badge-disputed
cancelled              → .badge-cancelled
```

---

## Component Usage Examples

### Customer Dashboard Header

```tsx
<div className="dashboard-customer min-h-screen">
  <header className="border-b border-white/10 p-6">
    <h1 className="text-white">My Jobs</h1>
    <p className="text-dashboard-customer-text-secondary">
      Manage your painting projects
    </p>
  </header>
</div>
```

### Job Card with Status

```tsx
<div className="dashboard-customer-card">
  <div className="flex items-start justify-between">
    <div>
      <h3 className="text-white font-semibold">Interior Painting</h3>
      <p className="text-dashboard-customer-text-secondary text-sm">
        Living Room • SW15 3DG
      </p>
    </div>
    <span className="badge-in-progress">
      <Zap className="h-3 w-3" />
      In Progress
    </span>
  </div>

  <div className="mt-4 flex gap-2">
    <button className="bg-dashboard-customer-accent text-black px-4 py-2 rounded">
      View Progress
    </button>
    <button className="border border-white/20 text-white px-4 py-2 rounded">
      Message Painter
    </button>
  </div>
</div>
```

### Painter Dashboard Earnings

```tsx
<div className="dashboard-painter min-h-screen">
  <div className="dashboard-painter-card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-dashboard-painter-text-secondary text-sm">
          This Month
        </p>
        <h2 className="text-white text-2xl font-semibold">£2,450</h2>
      </div>
      <div className="dashboard-painter-accent-bg p-3 rounded-lg">
        <TrendingUp className="h-5 w-5" />
      </div>
    </div>

    <div className="mt-4 pt-4 border-t border-white/10">
      <p className="text-dashboard-painter-text-secondary text-sm">
        Commission Rate
      </p>
      <div className="flex items-center gap-2 mt-2">
        <span className="dashboard-painter-accent font-semibold">10%</span>
        <span className="text-xs text-dashboard-painter-text-secondary">
          (Jobs 6-10)
        </span>
      </div>
    </div>
  </div>
</div>
```

---

## Responsive Design

### Mobile-First Approach

All utilities scale with Tailwind breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Example:**
```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  Responsive Heading
</h1>
```

### Dashboard Mobile Optimization

- Cards stack vertically on mobile
- Navigation collapses to menu
- Forms become single-column
- Status badges wrap appropriately

---

## Dark Mode

Both dashboards are already dark by default. No additional dark mode switching needed—the color tokens are optimized for darkness.

---

## Key CSS Variables

Reference these variables when extending the design system:

```css
/* Customer Dashboard */
--dashboard-customer-bg                 /* Primary background */
--dashboard-customer-card               /* Card background */
--dashboard-customer-accent             /* Orange accent */
--dashboard-customer-text-primary       /* White text */
--dashboard-customer-text-secondary     /* Gray text */
--dashboard-customer-success            /* Green */
--dashboard-customer-warning            /* Amber */
--dashboard-customer-danger             /* Red */

/* Painter Dashboard */
--dashboard-painter-bg                  /* Navy background */
--dashboard-painter-card                /* Navy card */
--dashboard-painter-accent              /* Blue accent */
--dashboard-painter-text-primary        /* White text */
--dashboard-painter-text-secondary      /* Slate text */
--dashboard-painter-success             /* Green */
--dashboard-painter-warning             /* Blue */
--dashboard-painter-danger              /* Red */
```

---

## Implementation Checklist

- [x] Color tokens defined in CSS variables
- [x] Dashboard theme classes created
- [x] Status badge utilities implemented
- [x] Typography system established
- [x] Animation keyframes configured
- [x] Tailwind config extended with dashboard colors
- [x] Responsive design utilities available
- [ ] Next: Build Authentication System (Section 2)
- [ ] Next: Build Customer Dashboard (Section 3)
- [ ] Next: Build Painter Dashboard (Section 4)

---

## Related Files

- `code/client/global.css` — Design tokens and component utilities
- `code/tailwind.config.ts` — Tailwind configuration with dashboard colors
- `code/STYLING_DOCUMENTATION.md` — Legacy styling guide (archive)

---

**Version:** 1.0  
**Last Updated:** April 2026  
**Status:** ✅ Complete — Ready for dashboard implementation
