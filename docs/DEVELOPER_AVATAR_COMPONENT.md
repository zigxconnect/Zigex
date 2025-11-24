# Developer Avatar Overlap Component

## Overview
The `DeveloperAvatarOverlap` component displays team members with overlapping circular avatars, replacing the floating card design in the hero section.

## Features
- ✅ Overlapping avatar display with custom initials
- ✅ Hover tooltips showing name and role
- ✅ Multiple size options (sm, md, lg)
- ✅ Gradient colors for each developer
- ✅ Responsive design
- ✅ Shows count of remaining team members if max display is exceeded
- ✅ Optional detailed labels view

## Location
```
components/ui/DeveloperAvatarOverlap.tsx
```

## Implementation

### Basic Usage
```tsx
import DeveloperAvatarOverlap from "@/components/ui/DeveloperAvatarOverlap";

export function MyComponent() {
  return (
    <DeveloperAvatarOverlap
      developers={[
        {
          id: '1',
          name: 'Alex Johnson',
          role: 'Lead Developer',
          initials: 'AJ',
          color: 'bg-gradient-to-br from-blue-500 to-blue-600',
        },
        // ... more developers
      ]}
      size="md"
      title="Meet Our Team"
      subtitle="Building Zigex"
    />
  );
}
```

## Props

### `developers` (Optional)
Array of developer objects with the following structure:
```typescript
interface Developer {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string; // Tailwind gradient class
}
```

**Default**: Includes 4 sample developers if not provided

### `maxDisplay` (Optional)
Maximum number of avatars to display before showing "+X more" count.
- **Type**: `number`
- **Default**: `4`

### `size` (Optional)
Avatar size variant.
- **Type**: `'sm' | 'md' | 'lg'`
- **Default**: `'md'`
- **Sizes**:
  - `sm`: 48px (w-12 h-12)
  - `md`: 64px (w-16 h-16)
  - `lg`: 80px (w-20 h-20)

### `showLabels` (Optional)
Whether to display detailed developer cards below avatars.
- **Type**: `boolean`
- **Default**: `false`

### `title` (Optional)
Section title.
- **Type**: `string`
- **Default**: `"Meet Our Team"`

### `subtitle` (Optional)
Section subtitle.
- **Type**: `string`
- **Default**: `"Passionate developers building the future"`

## Styling Details

### Avatar Colors
Use Tailwind gradient classes:
```tsx
const colors = [
  'bg-gradient-to-br from-blue-500 to-blue-600',
  'bg-gradient-to-br from-purple-500 to-purple-600',
  'bg-gradient-to-br from-emerald-500 to-emerald-600',
  'bg-gradient-to-br from-orange-500 to-orange-600',
  'bg-gradient-to-br from-pink-500 to-pink-600',
  'bg-gradient-to-br from-cyan-500 to-cyan-600',
];
```

### Hover Effects
- Avatar scale increases on hover
- Tooltip appears with developer name and role
- Shadow increases for depth

### Layout
- Avatars overlap with `-space-x-3` (small) to `-space-x-6` (large)
- Responsive z-index stacking
- Border styling with white borders for contrast

## Current Implementation (Hero Section)
Currently used in `components/sections/landing/HeroSection.tsx`:

```tsx
<div className="absolute -right-4 -bottom-4 bg-white rounded-xl shadow-xl p-6 border border-gray-200">
  <DeveloperAvatarOverlap
    developers={[
      {
        id: '1',
        name: 'Alex Johnson',
        role: 'Lead Developer',
        initials: 'AJ',
        color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      },
      // ... more team members
    ]}
    maxDisplay={4}
    size="md"
    title="Meet Our Team"
    subtitle="Building Zigex"
  />
</div>
```

**Key Differences from Original**:
- ❌ No floating animation (`animate-float` removed)
- ✅ Shows team avatars instead of job count
- ✅ Displays developer names and roles on hover
- ✅ Professional team showcase

## Usage Examples

### Small Size with Custom Team
```tsx
<DeveloperAvatarOverlap
  developers={myCustomTeam}
  size="sm"
  maxDisplay={3}
  title="Our Developers"
  subtitle="3 brilliant minds"
/>
```

### Large Size with Labels
```tsx
<DeveloperAvatarOverlap
  developers={fullTeamList}
  size="lg"
  maxDisplay={5}
  showLabels={true}
  title="Full Development Team"
  subtitle="Meet the team building your future"
/>
```

### Default Configuration
```tsx
<DeveloperAvatarOverlap />
```
Uses all default values and sample developers.

## CSS Classes Used
- Tailwind for responsive sizing
- Gradient backgrounds for visual appeal
- Shadow utilities for depth
- Transform utilities for hover effects
- Flex utilities for alignment

## Accessibility
- Tooltips provide additional context for screen readers
- Proper contrast ratios maintained
- Semantic HTML structure
- Keyboard accessible hover states

## Future Enhancements
- [ ] Click to view full profile
- [ ] Integration with user database
- [ ] Animation on load
- [ ] Filter by role
- [ ] Search functionality
- [ ] Social media links in tooltip

## Notes
- Component is fully responsive
- Works with dynamic developer lists
- No external dependencies beyond React
- CSS-in-JS for component styles
- Reusable across the application

---

**Status**: ✅ Ready for production use
