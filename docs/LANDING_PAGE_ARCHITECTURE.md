<!-- Landing Page Architecture & Visual Structure -->

# 🏗️ Landing Page Structure Guide

## Visual Page Layout

```
╔════════════════════════════════════════════════════════════════╗
║                      LANDING PAGE STRUCTURE                    ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ 1. HERO SECTION (BamendaHeroSection)                     │ ║
║  │ ────────────────────────────────────────────────────────│ ║
║  │ • Hero Title: "Launch Your Dream Career"                │ ║
║  │ • Subtitle & CTA buttons                                │ ║
║  │ • Dashboard mockup visualization                        │ ║
║  │ • Stats cards (2,500+ students, 85% success)            │ ║
║  │ • Testimonial carousel                                  │ ║
║  │ • Trust indicators                                      │ ║
║  │ 🎨 Colors: Blue/Indigo gradient background              │ ║
║  │ 📏 Height: 100vh with overflow content                  │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ DIVIDER: Wave Variant                                    │ ║
║  │ • SVG wave animation                                    │ ║
║  │ • Gradient fill (blue to indigo)                        │ ║
║  │ 🎨 Height: 128px (h-32)                                 │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ 2. VISION & MISSION SECTION (NEW)                        │ ║
║  │ ────────────────────────────────────────────────────────│ ║
║  │ ┌─────────────────┬─────────────────┐                  │ ║
║  │ │ VISION CARD     │ MISSION CARD    │                  │ ║
║  │ │ • Title         │ • Title         │                  │ ║
║  │ │ • Icon (Light)  │ • Icon (Target) │                  │ ║
║  │ │ • Description   │ • Description   │                  │ ║
║  │ │ • Hover effect  │ • Hover effect  │                  │ ║
║  │ └─────────────────┴─────────────────┘                  │ ║
║  │                                                         │ ║
║  │ CORE VALUES GRID (4 columns)                            │ ║
║  │ ┌──────────┬──────────┬──────────┬──────────┐           │ ║
║  │ │Innovation│Integrity │Excellence│ Impact   │           │ ║
║  │ │ (Rocket) │ (Heart)  │ (Target) │(Lightbulb)          │ ║
║  │ └──────────┴──────────┴──────────┴──────────┘           │ ║
║  │ 🎨 White cards with colored icons                      │ ║
║  │ 📏 Padding: py-20 (80px)                               │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ DIVIDER: Default Variant                                │ ║
║  │ • Gradient line divider                                │ ║
║  │ 🎨 Gradient: transparent → blue → transparent           │ ║
║  │ 📏 Height: 1px (h-px)                                  │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ 3. FEATURED INTERNSHIPS SECTION                          │ ║
║  │ ────────────────────────────────────────────────────────│ ║
║  │ • Grid of 6 job cards (3 columns on desktop)            │ ║
║  │ • Each card shows:                                      │ ║
║  │   - Company logo/badge                                 │ ║
║  │   - Job title                                          │ ║
║  │   - Location badge                                     │ ║
║  │   - Apply button                                       │ ║
║  │ • Intersection Observer for animations                 │ ║
║  │ 🎨 Colorful company badges                             │ ║
║  │ 📏 Responsive: 1 col (mobile) → 2 col (tablet) → 3 col │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ DIVIDER: Gradient Variant                               │ ║
║  │ • Full-width gradient background                       │ ║
║  │ • Gradient line inside                                 │ ║
║  │ 🎨 Background: transparent → blue → transparent         │ ║
║  │ 📏 Padding: py-8 (32px)                                │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ 4. WHY CHOOSE US SECTION (WhyChoose)                    │ ║
║  │ ────────────────────────────────────────────────────────│ ║
║  │ • Section title & description                          │ ║
║  │ • 4 feature cards in grid:                              │ ║
║  │   - Verified Companies (with icon)                     │ ║
║  │   - Competitive Pay (with icon)                        │ ║
║  │   - Skill Development (with icon)                      │ ║
║  │   - Network Building (with icon)                       │ ║
║  │ • Background: Light (F8FAFC)                           │ ║
║  │ 🎨 Orange accent circles behind icons                  │ ║
║  │ 📏 Responsive: stacks on mobile                        │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

## Component Tree

```
page.tsx (Main Landing Page)
│
├─ BamendaHeroSection
│  ├─ Badge
│  ├─ Headline (with gradient text)
│  ├─ Subtitle
│  ├─ CTA Buttons
│  ├─ Trust Indicators
│  ├─ Dashboard Mockup
│  ├─ Stats Grid
│  ├─ Feature Cards
│  └─ Testimonial Carousel
│
├─ SectionDivider (variant="wave")
│  └─ SVG Wave Animation
│
├─ VisionMissionSection (NEW)
│  ├─ Vision Card
│  │  ├─ Icon Badge
│  │  └─ Text Content
│  ├─ Mission Card
│  │  ├─ Icon Badge
│  │  └─ Text Content
│  └─ Core Values Grid
│     ├─ Innovation Card
│     ├─ Integrity Card
│     ├─ Excellence Card
│     └─ Impact Card
│
├─ SectionDivider (variant="default")
│  └─ Gradient Line
│
├─ FeaturedInternships
│  ├─ Section Header
│  └─ Job Cards Grid (6 items)
│     ├─ Company Badge
│     ├─ Title
│     ├─ Location
│     └─ Apply Button
│
├─ SectionDivider (variant="gradient")
│  └─ Gradient Background + Line
│
└─ WhyChoose
   ├─ Section Title
   └─ Feature Cards Grid (4 items)
      ├─ Icon Circle
      ├─ Title
      └─ Description
```

## Color System

### Primary Palette
```
Blue:     #3B82F6  (rgb(59, 130, 246))
Indigo:   #6366F1  (rgb(99, 102, 241))
Emerald:  #10B981  (rgb(16, 185, 129))
Orange:   #EA580C  (rgb(234, 88, 12))
```

### Backgrounds
```
Hero:            from-slate-50 via-blue-50 to-indigo-100
Vision/Mission:  from-white via-blue-50 to-indigo-50
Features:        Default white
Why Choose:      F8FAFC (light gray-blue)
```

### Text Colors
```
Headlines:  text-gray-900 (font-bold)
Body:       text-gray-600 (readable contrast)
Accent:     text-blue-700, text-indigo-600
```

## Responsive Breakpoints

### Mobile (< 640px)
- Single column layouts
- Full-width sections
- Smaller padding: px-4
- Stacked cards vertically
- Reduced font sizes

### Tablet (640px - 1024px)
- 2 column grids
- Medium padding: px-6-px-8
- Responsive text sizes
- Optimized spacing

### Desktop (1024px+)
- 3-4 column grids
- Full container width
- Large padding: px-10-px-12
- Maximum text sizes
- Enhanced hover effects

## Animation & Interactivity

### Entry Animations
```
Hero content: staggered fade-in + translateY
Vision cards: fade-in with scale
Feature cards: intersection observer trigger
```

### Hover Effects
```
Vision cards:  shadow increase + gradient overlay
Feature cards: scale + icon rotate
Buttons:       scale + shadow color change
```

### Scroll Effects
```
Intersection Observer: Triggers animations as sections come into view
Smooth transitions: All 300ms-500ms duration
GPU acceleration: transform & opacity
```

## Performance Optimizations

- ✅ Server-side rendering (SSR)
- ✅ Lazy loading images
- ✅ Optimized component structure
- ✅ CSS-in-JS for component styles
- ✅ Intersection Observer for animations
- ✅ Image optimization via Next.js

## Accessibility Features

- ✅ Semantic HTML structure
- ✅ Proper heading hierarchy (h1, h2, h3)
- ✅ Alt text for images
- ✅ Color contrast ratios WCAG AA
- ✅ Keyboard navigation support
- ✅ ARIA labels where needed

---

**Status**: ✅ Complete & Production Ready
