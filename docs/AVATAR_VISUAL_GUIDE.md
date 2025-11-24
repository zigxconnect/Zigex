<!-- Visual Guide for Developer Avatar Overlap -->

# 🎨 Developer Avatar Overlap - Visual Guide

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                          HERO SECTION                           │
│                                                                 │
│  ┌────────────────────────┬─────────────────────────────────┐  │
│  │                        │                                 │  │
│  │  Hero Content          │  Dashboard Mockup              │  │
│  │  - Title               │  - Chart                       │  │
│  │  - Subtitle            │  - Job Cards                   │  │
│  │  - CTA Buttons         │                                │  │
│  │  - Trust Indicators    │                                │  │
│  │  - Stats               │  ┌──────────────────────────┐  │  │
│  │                        │  │  Meet Our Team           │  │  │
│  │                        │  │  Building Zigex          │  │  │
│  │                        │  │                          │  │  │
│  │                        │  │  [AJ] [SS] [MC] [ED]    │  │  │
│  │                        │  │                          │  │  │
│  │                        │  └──────────────────────────┘  │  │
│  └────────────────────────┴─────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### Avatar Overlap Visualization

#### With 4 Developers (Default)
```
Position:  ┌─────────────────────────┐
Absolute   │  Meet Our Team          │
-right-4   │  Building Zigex         │
-bottom-4  │                         │
           │  [AJ] [SS] [MC] [ED]   │
           │   Alex Sarah Mike Emma  │
           └─────────────────────────┘

Avatar Order (Left to Right):
1st: [AJ] - Alex Johnson (Blue)
2nd: [SS] - Sarah Smith (Purple)
3rd: [MC] - Mike Chen (Emerald)
4th: [ED] - Emma Davis (Orange)

Overlap Effect:
[AJ]────────────────── Z-index: 4
   └─ [SS]───────────── Z-index: 3
      └─ [MC]────────── Z-index: 2
         └─ [ED]─────── Z-index: 1
```

#### Size Comparison

```
Size: SM          Size: MD          Size: LG
━━━━━━━━━━━       ━━━━━━━━━━━━━     ━━━━━━━━━━━━━━━
│ [AJ][SS] │      │ [AJ]  [SS] │    │  [AJ]   [SS]  │
│ 48x48px  │      │ 64x64px    │    │ 80x80px       │
━━━━━━━━━━━       ━━━━━━━━━━━━━     ━━━━━━━━━━━━━━━
 -ml-3             -ml-4             -ml-6
 border-2          border-3          border-4
```

---

## Hover Interaction

### Default State
```
┌─────────────────────────────────────┐
│ Meet Our Team                       │
│ Building Zigex                      │
│                                     │
│   [AJ]  [SS]  [MC]  [ED]          │
│   4 Developers                      │
└─────────────────────────────────────┘
```

### Hover on Avatar
```
                 ┌──────────────────┐
                 │ Alex Johnson     │
                 │ Lead Developer   │
                 └──────────────────┘
                        ▲
┌─────────────────────────────────────┐
│ Meet Our Team                       │
│ Building Zigex                      │
│                                     │
│ [AJ]↑ [SS]  [MC]  [ED]            │
│   ↳ Hover (scale 110%, shadow up)   │
│   4 Developers                      │
└─────────────────────────────────────┘
```

---

## Color System

### Developer Gradient Colors

```
Developer: Alex Johnson (Lead Developer)
Gradient:  from-blue-500 → to-blue-600
           ┌──────────────┐
           │  [AJ]        │
           │ ■ ■ ■ ■ ■ ■ │
           │ ■ ■ ■ ■ ■ ■ │
           │ ■ ■ ■ ■ ■ ■ │
           └──────────────┘

Developer: Sarah Smith (Full Stack)
Gradient:  from-purple-500 → to-purple-600
           ┌──────────────┐
           │  [SS]        │
           │ ■ ■ ■ ■ ■ ■ │
           │ ■ ■ ■ ■ ■ ■ │
           │ ■ ■ ■ ■ ■ ■ │
           └──────────────┘

Developer: Mike Chen (Backend Dev)
Gradient:  from-emerald-500 → to-emerald-600
           ┌──────────────┐
           │  [MC]        │
           │ ■ ■ ■ ■ ■ ■ │
           │ ■ ■ ■ ■ ■ ■ │
           │ ■ ■ ■ ■ ■ ■ │
           └──────────────┘

Developer: Emma Davis (Frontend Dev)
Gradient:  from-orange-500 → to-orange-600
           ┌──────────────┐
           │  [ED]        │
           │ ■ ■ ■ ■ ■ ■ │
           │ ■ ■ ■ ■ ■ ■ │
           │ ■ ■ ■ ■ ■ ■ │
           └──────────────┘
```

---

## Responsive Breakpoints

### Mobile (< 640px)
```
┌──────────────────┐
│ Meet Our Team    │
│ Building Zigex   │
│                  │
│  [AJ] [SS]       │
│  [MC] [ED]       │
│  4 Developers    │
└──────────────────┘
Size: sm (48px)
Stacked for space
```

### Tablet (640px - 1024px)
```
┌─────────────────────────┐
│ Meet Our Team           │
│ Building Zigex          │
│                         │
│  [AJ] [SS] [MC]        │
│  4 Developers           │
└─────────────────────────┘
Size: md (64px)
Better spacing
```

### Desktop (> 1024px)
```
┌─────────────────────────────────┐
│ Meet Our Team                   │
│ Building Zigex                  │
│                                 │
│  [AJ] [SS] [MC] [ED]           │
│  4 Developers                   │
└─────────────────────────────────┘
Size: md/lg (64-80px)
Full overlap effect
```

---

## CSS Layout Properties

### Avatar Container
```css
display: flex;
align-items: center;
gap: 0.5rem;  /* gap-2 */

/* Avatars */
display: flex;
margin: -0.75rem;  /* -ml-3 (sm) to -1.5rem (lg) */

/* Individual Avatar */
width: 64px;        /* md size */
height: 64px;
border-radius: 50%;
border: 3px solid white;
background: gradient;
box-shadow: shadow-lg;
position: relative;
z-index: calculated;

/* Hover Effect */
transform: scale(1.1);
box-shadow: shadow-xl;
z-index: 50;
transition: all 300ms;
```

---

## Tooltip Positioning

### Tooltip vs Avatar
```
Without Hover:
  Avatar is centered, tooltip hidden
  Opacity: 0

On Hover:
  Tooltip appears above avatar
  
  ┌─────────────────┐  (Tooltip)
  │ Alex Johnson    │  opacity: 100
  │ Lead Developer  │  position: absolute
  └─────────────────┘  bottom-full
          ▲            left-1/2
          │            -translate-x-1/2
       [AJ]            mb-2
```

---

## Animation Timings

### Hover Effects
```
Scale Transform:
  Duration: 300ms
  Easing: default (ease)
  From: scale(1)
  To: scale(1.1)

Shadow Change:
  Duration: 300ms
  From: shadow-lg
  To: shadow-xl

Tooltip Fade:
  Duration: 300ms
  From: opacity-0
  To: opacity-100
```

---

## Before vs After Comparison

### BEFORE: Floating Job Card
```
┌─────────────────────────┐
│ +51 New Jobs            │  ← Floating
│ This week               │
│ 🔼 Trending Up Icon     │
└─────────────────────────┘
   animate-float (moving)
   Position: absolute
   -right-4 -bottom-4
   padding: p-4
   Static content
```

### AFTER: Developer Avatar Overlap
```
┌─────────────────────────┐
│ Meet Our Team           │  ← Static
│ Building Zigex          │
│                         │
│ [AJ] [SS] [MC] [ED]    │  ← Interactive
│ (Hover for details)     │
│ 4 Developers            │
└─────────────────────────┘
   No animation
   Position: absolute
   -right-4 -bottom-4
   padding: p-6
   Interactive content
```

---

## Implementation Checklist

- [x] Component created
- [x] Props typed with TypeScript
- [x] Default developers configured
- [x] Hover tooltips implemented
- [x] Gradient colors applied
- [x] Responsive sizes added
- [x] Optional labels feature added
- [x] Accessibility considered
- [x] Component integrated in HeroSection
- [x] Documentation created
- [x] Visual guide prepared
- [x] Ready for production

---

**Location**: `components/ui/DeveloperAvatarOverlap.tsx`
**Usage**: Imported in `components/sections/landing/HeroSection.tsx`
**Status**: ✅ Ready to test on http://localhost:3000
