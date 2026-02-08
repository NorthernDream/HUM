# Premium Design System - Swiss Minimalism

## Design Philosophy

The redesign follows principles of Swiss minimalism and premium digital products:
- **Clarity**: Clean typography, generous whitespace
- **Consistency**: Cohesive color palette, unified spacing
- **Elegance**: Subtle shadows, smooth transitions
- **Professionalism**: No unnecessary colors or emojis

## Color Palette

### Primary Colors
- **Primary**: `#2C3E50` - Deep slate (text, headings)
- **Secondary**: `#34495E` - Muted slate
- **Accent**: `#3498DB` - Refined blue (CTAs, links)

### Neutrals
- **Background**: `#FFFFFF` - Pure white
- **Surface**: `#F8F9FA` - Light gray (page background)
- **Border**: `#E9ECEF` - Subtle borders
- **Divider**: `#DEE2E6` - Section dividers

### Text Hierarchy
- **Primary**: `#2C3E50` - Main content
- **Secondary**: `#6C757D` - Supporting text
- **Tertiary**: `#ADB5BD` - Metadata, timestamps

### Status Colors
- **Success**: `#27AE60` - Green
- **Warning**: `#F39C12` - Orange
- **Error**: `#E74C3C` - Red
- **Info**: `#3498DB` - Blue

## Typography

### Font Family
```css
-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
```

### Font Sizes
- **xs**: 12px - Metadata, captions
- **sm**: 13-14px - Body text, labels
- **base**: 15-16px - Primary content
- **lg**: 18px - Subheadings
- **xl**: 20-24px - Section titles
- **xxl**: 32px - Page titles

### Font Weights
- **Normal**: 400 - Body text
- **Medium**: 500 - Labels, buttons
- **Semibold**: 600 - Headings
- **Bold**: 700 - Emphasis (rarely used)

## Spacing System

### Scale
- **xs**: 8px
- **sm**: 16px
- **md**: 24px
- **lg**: 32px
- **xl**: 48px
- **xxl**: 64px

### Application
- **Component padding**: 24-48px
- **Section spacing**: 32-48px
- **Element spacing**: 16-24px
- **Inline spacing**: 8-12px

## Border Radius

- **sm**: 4px - Small elements
- **md**: 8px - Buttons, inputs
- **lg**: 12px - Cards
- **xl**: 16px - Large containers

## Shadows

### Elevation Levels
- **sm**: `0 1px 3px rgba(44, 62, 80, 0.08)` - Cards at rest
- **md**: `0 4px 12px rgba(44, 62, 80, 0.08)` - Dropdowns
- **lg**: `0 8px 24px rgba(44, 62, 80, 0.12)` - Modals, hover states

## Component Specifications

### Header
- Height: 72px
- Background: White
- Border: 1px solid #E9ECEF
- Padding: 0 48px
- Position: Sticky
- Shadow: Subtle on scroll

### Cards
- Background: White
- Border radius: 12px
- Shadow: 0 1px 3px rgba(44, 62, 80, 0.08)
- Padding: 48px
- Hover: Lift with increased shadow

### Buttons
- Height: 48px (large), 40px (default)
- Border radius: 8px
- Font weight: 500
- Primary color: #3498DB
- Hover: #2980B9

### Inputs
- Height: 40px (large)
- Border: 1px solid #E9ECEF
- Border radius: 8px
- Focus: Blue border + subtle shadow

### Audio Players
- Height: 40px
- Full width
- Custom styling to match theme

## Layout

### Container
- Max width: 1400px (main content)
- Max width: 800px (forms)
- Max width: 1200px (TTS page)
- Centered with auto margins

### Grid
- Gutter: 24px (desktop), 16px (mobile)
- Responsive breakpoints:
  - xs: <576px
  - sm: ≥576px
  - md: ≥768px
  - lg: ≥992px
  - xl: ≥1200px

## Responsive Design

### Mobile (<768px)
- Single column layouts
- Reduced padding (24px)
- Stacked cards
- Full-width buttons

### Tablet (768px-1024px)
- 2-column grids
- Moderate padding (32px)
- Balanced spacing

### Desktop (>1024px)
- Multi-column grids
- Full padding (48px)
- Optimal spacing

## Interactions

### Hover States
- Cards: Lift + shadow increase
- Buttons: Darken background
- Links: Color change to accent

### Transitions
- Duration: 0.3s
- Easing: ease
- Properties: transform, box-shadow, background

### Focus States
- Blue outline: 2px solid #3498DB
- Shadow: 0 0 0 2px rgba(52, 152, 219, 0.1)

## Icons

- Use Ant Design icons exclusively
- Size: 18-24px for UI elements
- Color: Match text hierarchy
- No emojis in production UI

## Best Practices

### Do's
✓ Use consistent spacing from the scale
✓ Maintain color palette
✓ Apply subtle shadows
✓ Use proper text hierarchy
✓ Ensure adequate contrast
✓ Test on multiple screen sizes

### Don'ts
✗ Mix custom colors outside palette
✗ Use emojis in UI
✗ Over-use bold weights
✗ Create inconsistent spacing
✗ Use harsh shadows
✗ Ignore responsive design

## Accessibility

- Minimum contrast ratio: 4.5:1
- Focus indicators: Always visible
- Touch targets: Minimum 44x44px
- Keyboard navigation: Full support
- Screen reader: Semantic HTML

## Performance

- Optimize images and assets
- Lazy load off-screen content
- Minimize re-renders
- Use CSS transforms for animations
- Preload critical fonts

---

This design system creates a premium, professional experience that would make Steve Jobs smile.
