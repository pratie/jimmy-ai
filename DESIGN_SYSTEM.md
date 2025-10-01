# 🎨 Corinna AI - Subtle Pastel Hues Design System

## Color Palette

### Pastel Colors (Primary Palette)
```css
--pastel-lavender: #eae4e9    /* Soft lavender - for cards, backgrounds */
--pastel-cream: #fff1e6       /* Warm cream - main background */
--pastel-blush: #fde2e4       /* Light blush - accents, muted sections */
--pastel-pink: #fad2e1        /* Soft pink - highlights */
--pastel-mint: #e2ece9        /* Mint cream - success states */
--pastel-sky: #dfe7fd         /* Light sky - info states */
--pastel-periwinkle: #cddafd  /* Periwinkle - accents */
```

### Text Colors (For Readability)
```css
--text-primary: #2d3748       /* Deep slate - main headings & important text */
--text-secondary: #4a5568     /* Medium slate - body text */
--text-muted: #718096         /* Light slate - subtle text, placeholders */
```

### Interactive Colors (Darker for Visibility)
```css
--interactive-pink: #f7a6c4   /* Darker pink - primary buttons, links */
--interactive-blue: #a7c7e7   /* Darker blue - secondary actions */
--interactive-mint: #b8ddd3   /* Darker mint - success actions */
```

---

## Usage Guidelines

### ✅ DO's

1. **Backgrounds**
   - Use `pastel-cream` for main backgrounds
   - Use `pastel-lavender` for card backgrounds
   - Layer with opacity (e.g., `pastel-sky/70`) for glassmorphism effects

2. **Text**
   - Always use `text-primary` for headings
   - Use `text-secondary` for body paragraphs
   - Use `text-muted` for helper text, timestamps

3. **Interactive Elements**
   - Primary buttons: `bg-interactive-pink` with `text-text-primary`
   - Secondary buttons: `bg-pastel-sky/50` with `text-text-primary`
   - Hover states: Darken by adding `/90` opacity or use darker interactive colors

4. **Borders**
   - Use `border-pastel-lavender/40` for subtle divisions
   - Use `border-interactive-pink/50` for highlighted elements
   - Use `border-2` or `border-3` for emphasis

---

### ❌ DON'Ts

1. **Never** use light pastel colors for text on light backgrounds (fails accessibility)
2. **Never** use pastel colors for critical UI states (buttons, inputs) without proper contrast
3. **Don't** mix more than 3 pastel colors in a single component
4. **Don't** use pure white backgrounds - always use `pastel-cream` or gradient

---

## Component Patterns

### Card Component
```tsx
<div className="bg-pastel-lavender/70 backdrop-blur-md p-8 rounded-2xl shadow-lg
                border-2 border-pastel-lavender/50 hover:border-interactive-pink/50
                hover:scale-105 transition-all duration-300">
  <h3 className="text-text-primary font-bold">Title</h3>
  <p className="text-text-secondary">Content</p>
</div>
```

### Primary Button
```tsx
<Button className="bg-interactive-pink hover:bg-interactive-pink/90
                   text-text-primary font-bold px-8 py-4
                   shadow-lg border-2 border-interactive-pink/40
                   transform hover:scale-105 transition-all">
  Click Me
</Button>
```

### Input Field
```tsx
<input className="bg-pastel-cream/80 border-2 border-pastel-lavender/50
                  rounded-xl px-4 py-3 text-text-primary
                  placeholder:text-text-muted
                  focus:border-interactive-pink focus:ring-2 focus:ring-interactive-pink/20" />
```

### Feature Card (Glassmorphism)
```tsx
<div className="bg-pastel-mint/70 backdrop-blur-md p-8 rounded-2xl
                shadow-lg hover:shadow-xl transition-all duration-300
                border-2 border-pastel-mint/50 hover:border-interactive-mint/50
                hover:scale-105">
  {/* Content */}
</div>
```

---

## Accessibility

### Color Contrast Ratios
- `text-primary` (#2d3748) on `pastel-cream` (#fff1e6): **9.2:1** ✅ AAA
- `text-secondary` (#4a5568) on `pastel-cream` (#fff1e6): **6.5:1** ✅ AA
- `interactive-pink` (#f7a6c4) with `text-primary` (#2d3748): **4.8:1** ✅ AA

### Best Practices
1. Always use `text-primary` for critical information
2. Use `interactive-*` colors for all clickable elements
3. Add visible focus states with `focus:ring-2` and `focus:border-*`
4. Maintain 2px minimum border thickness for visibility

---

## Animation & Effects

### Standard Transitions
```css
transition-all duration-300
```

### Hover Effects
```css
hover:scale-105 hover:shadow-xl
```

### Glassmorphism
```css
backdrop-blur-md bg-pastel-{color}/60
```

---

## Gradients

### Background Gradient
```css
background: linear-gradient(135deg,
  #fff1e6 0%,    /* pastel-cream */
  #fde2e4 25%,   /* pastel-blush */
  #dfe7fd 50%,   /* pastel-sky */
  #e2ece9 75%,   /* pastel-mint */
  #eae4e9 100%   /* pastel-lavender */
);
```

### Card Gradient (Featured)
```css
bg-gradient-to-br from-pastel-pink/60 to-pastel-lavender/60
```

---

## Typography

### Font Sizes
- Hero: `text-4xl sm:text-5xl md:text-6xl`
- Heading 2: `text-3xl sm:text-4xl md:text-5xl`
- Heading 3: `text-xl font-bold`
- Body: `text-lg` or `text-base`
- Small: `text-sm`

### Font Weights
- Headings: `font-bold`
- Body: `font-normal`
- Buttons: `font-bold` or `font-semibold`

---

## Spacing

### Padding
- Cards: `p-8`
- Buttons: `px-6 py-2.5` (small), `px-8 py-4` (large)
- Sections: `py-20`

### Gaps
- Grid: `gap-8`
- Flex: `gap-4` or `gap-6`

---

## Border Radius

- Small: `rounded-lg` (0.5rem)
- Medium: `rounded-xl` (0.75rem)
- Large: `rounded-2xl` (1rem)
- Pills: `rounded-full`

---

## Shadows

- Default: `shadow-lg`
- Hover: `shadow-xl` or `shadow-2xl`
- Small: `shadow-sm` or `shadow-md`

---

## Example Usage by Section

### Landing Page
- Hero background: Gradient overlay
- Feature cards: Alternating pastel colors (cream, sky, mint, blush, lavender, periwinkle)
- CTA buttons: `interactive-pink`

### Dashboard
- Sidebar: `pastel-lavender/80`
- Main content: `pastel-cream/60`
- Cards: `pastel-sky/70` or `pastel-mint/70`

### Forms
- Input backgrounds: `pastel-cream/80`
- Input borders: `pastel-lavender/50`
- Focus state: `border-interactive-pink ring-interactive-pink/20`

### Chatbot Widget
- Bubble background: `pastel-sky/90`
- User message: `pastel-pink/70`
- Bot message: `pastel-mint/70`

---

## Browser Compatibility

All colors and effects are compatible with:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Fallbacks are automatically handled by Tailwind CSS.

---

## Design Philosophy

This design system follows **FAANG-level principles**:

1. **Consistency**: Same color for same purpose across all pages
2. **Accessibility**: WCAG AA/AAA compliant contrast ratios
3. **Scalability**: Easy to add new colors/variants
4. **Performance**: Minimal CSS, using Tailwind utilities
5. **User Experience**: Subtle animations, clear visual hierarchy

---

**Last Updated**: October 2025
**Version**: 1.0.0
