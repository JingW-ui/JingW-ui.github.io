# Godfather Trilogy Tribute Website - Design Style Guide

## Design Philosophy

### Visual Language
**Vintage Film Aesthetic**: The website embodies the golden age of Hollywood cinema (1940s-1970s) with a sophisticated, film noir-inspired design that evokes the era of the Godfather trilogy.

**Emotional Resonance**: Every design element should evoke nostalgia, respect for cinematic artistry, and the weight of family legacy that defines the trilogy.

**Cinematic Quality**: The design should feel like walking through a curated film museum exhibit, with each section revealing layers of storytelling and craftsmanship.

## Color Palette

### Primary Colors
- **Deep Sepia Brown** (#3C2415) - Main background, evoking aged film stock
- **Warm Amber** (#D4A574) - Accent color for highlights and interactive elements
- **Vintage Gold** (#B8860B) - Premium accents, buttons, special elements
- **Rich Burgundy** (#722F37) - Secondary accents, error states, important text

### Supporting Colors
- **Cream White** (#F5F5DC) - Primary text color, ensuring 4.5:1 contrast ratio
- **Charcoal Gray** (#36454F) - Secondary text, subtle elements
- **Muted Olive** (#6B8E23) - Success states, positive interactions
- **Aged Brass** (#CD7F32) - Metallic accents, borders, frames

### Color Usage Rules
- Never use pure black (#000000) or pure white (#FFFFFF)
- Maintain minimum 4.5:1 contrast ratio for all text
- Use sepia tones consistently across all backgrounds
- Apply vintage film grain overlay to all major sections

## Typography

### Primary Font Stack
**Display/Headers**: "Playfair Display", "Times New Roman", serif
- Elegant, classical serif that evokes 1940s-50s sophistication
- Used for main headings, film titles, character names
- Weights: 400 (regular), 700 (bold), 900 (black)

### Body Text
**Content**: "Source Sans Pro", "Arial", sans-serif
- Clean, readable sans-serif for modern web standards
- Used for paragraphs, descriptions, interface text
- Weights: 300 (light), 400 (regular), 600 (semibold)

### Accent Font
**Quotes/Special Text**: "Crimson Text", "Georgia", serif
- Used for iconic quotes, testimonials, special callouts
- Weight: 400 (regular), 600 (semibold)

## Visual Effects & Styling

### Background Effects
**Primary**: Subtle film grain texture overlay on sepia base
**Secondary**: Vintage paper texture for content sections
**Accent**: Aged film strip borders for navigation elements

### Animation Library Usage
- **Anime.js**: Smooth transitions, character card reveals, quote animations
- **Typed.js**: Typewriter effect for iconic quotes
- **Splitting.js**: Letter-by-letter animations for headings
- **Splide.js**: Hero carousel with vintage film transitions

### Interactive Elements
**Hover Effects**: 
- Subtle sepia tone shifts (5-10% brightness change)
- Gentle shadow expansion
- Vintage brass border highlights
- Smooth 300ms transitions

**Button Styling**:
- Aged brass background with sepia text
- Vintage film strip borders
- Subtle inner shadow for depth
- Hover: slight glow effect in warm amber

### Image Treatment
**Hero Images**: High contrast black and white with sepia wash
**Character Photos**: Vintage portrait style with soft vignetting
**Background Textures**: Film grain, aged paper, subtle scratches
**Icons**: Custom designed in vintage style using brass/gold tones

## Layout & Composition

### Grid System
- 12-column responsive grid
- Generous whitespace to evoke premium feel
- Asymmetrical layouts inspired by film composition
- Golden ratio proportions for major sections

### Section Breaks
- Film strip dividers between major sections
- Vintage ornamental borders for content areas
- Subtle drop shadows for depth without modern harshness

### Navigation
- Vintage film reel inspired menu design
- Horizontal layout with brass accents
- Smooth transitions between sections
- Breadcrumb trail using film strip metaphor

## Responsive Design

### Breakpoints
- Mobile: 320px - 768px
- Tablet: 768px - 1024px  
- Desktop: 1024px+

### Mobile Adaptations
- Simplified film grain effects for performance
- Stacked layouts maintaining vintage aesthetic
- Touch-friendly interactive elements
- Optimized font sizes for readability

## Accessibility

### Contrast Requirements
- All text meets WCAG 4.5:1 minimum contrast ratio
- Interactive elements have clear focus states
- Color is never the only indicator of meaning

### Motion Preferences
- Respect user's reduced motion settings
- Provide toggle for film grain effects
- Essential animations remain functional without motion

## Implementation Notes

### CSS Custom Properties
```css
:root {
  --sepia-brown: #3C2415;
  --warm-amber: #D4A574;
  --vintage-gold: #B8860B;
  --rich-burgundy: #722F37;
  --cream-white: #F5F5DC;
  --charcoal-gray: #36454F;
  --muted-olive: #6B8E23;
  --aged-brass: #CD7F32;
}
```

### Performance Considerations
- Optimize film grain textures for web delivery
- Use CSS filters for vintage effects where possible
- Lazy load heavy vintage textures
- Provide fallback solid colors if textures fail to load