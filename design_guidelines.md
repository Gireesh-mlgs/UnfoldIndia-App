# Design Guidelines: Premium Glassmorphic Mobile App

## Architecture Decisions

### Authentication
**No authentication required** - This is a UI showcase app with local data.
- Include a Profile screen with:
  - User-customizable circular avatar
  - Display name field
  - App preferences (theme toggle for light/dark mode)
  - Stats cards showing dummy metrics

### Navigation
**Tab Navigation** with 4 tabs:
- Home (house icon)
- Explore (search/compass icon)
- Floating Action Button (plus icon with glow)
- Profile (user icon)

The FAB should be positioned in the center gap of the tab bar with elevated shadow and glow effect.

**Navigation Stack:**
- Splash Screen → auto-transitions to Home after animation
- Home Screen (Tab 1)
- Explore Screen (Tab 2)
- Profile Screen (Tab 3)
- All screens use transparent/blurred headers where applicable

---

## Visual Design System

### Color Palette
**Gradients (Primary theme):**
- Purple to Blue: `['#8B5CF6', '#3B82F6']`
- Purple to Pink: `['#A855F7', '#EC4899']`
- Blue to Cyan: `['#3B82F6', '#06B6D4']`
- Neon accent: `['#F59E0B', '#EF4444']` for CTAs

**Light Mode:**
- Background: White with gradient overlays
- Card backgrounds: Semi-transparent white (rgba(255, 255, 255, 0.15))
- Text primary: `#1F2937`
- Text secondary: `#6B7280`

**Dark Mode:**
- Background: `#0F172A` with gradient overlays
- Card backgrounds: Semi-transparent dark (rgba(255, 255, 255, 0.05))
- Text primary: `#F9FAFB`
- Text secondary: `#9CA3AF`

### Typography
**Fonts:** Poppins (headings), Inter (body)
- H1: Poppins Bold, 32px
- H2: Poppins SemiBold, 24px
- H3: Poppins Medium, 20px
- Body: Inter Regular, 16px
- Caption: Inter Regular, 14px

### Glassmorphism Specifications
**All cards must use:**
- Background: Semi-transparent with blur
- Blur intensity: 20-40 (BlurView)
- Border: 1px solid rgba(255, 255, 255, 0.2)
- Border radius: 30px minimum
- Backdrop filter effect for frosted glass look

**Shadow specifications for glass cards:**
- shadowColor: '#000'
- shadowOffset: { width: 0, height: 10 }
- shadowOpacity: 0.15
- shadowRadius: 20
- elevation: 10 (Android)

### Spacing System
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- XXL: 48px

Use generous spacing throughout - minimum 16px padding inside cards, 24px between major sections.

### Interactive Elements
**Floating Action Button:**
- Size: 64px × 64px
- Border radius: 32px
- Gradient background (purple to pink)
- Glow effect:
  - shadowColor: '#A855F7'
  - shadowOffset: { width: 0, height: 4 }
  - shadowOpacity: 0.5
  - shadowRadius: 16
- Scale animation on press (0.95)

**Buttons (Neon style):**
- Border radius: 20px
- Gradient backgrounds
- Soft glow shadow matching gradient color
- Pulse animation on press

**All touchables:**
- Opacity change on press (0.7)
- Scale animation (subtle, 0.98-1.0)
- Haptic feedback

---

## Screen Specifications

### 1. Splash Screen
**Purpose:** Branded loading experience with smooth transition

**Layout:**
- Full-screen gradient background (purple to blue diagonal)
- Centered animated logo (fade-in, scale from 0.8 to 1.0)
- Auto-transition to Home after 2.5 seconds with fade animation

**No header, no safe area constraints**

### 2. Home Screen
**Purpose:** Main content hub with trending and recommended sections

**Header:**
- Transparent with blur effect
- Animated slide-down on mount
- Title: "Discover" (left-aligned)
- Right button: Theme toggle icon

**Content (Scrollable):**
- Top: Animated header text (fade + slide)
- Horizontal scroll section: "Trending" (glassmorphic cards, 280px wide)
- Vertical section: "Recommended" (full-width glass cards)
- Each card: image, title, subtitle, gradient accent

**Safe area insets:**
- Top: headerHeight + 32px
- Bottom: tabBarHeight + 32px

### 3. Explore Screen
**Purpose:** Search and browse categories

**Header:**
- Transparent
- Search bar with soft glow effect (blur background, rounded 25px)
- Search bar shadow: subtle cyan/blue glow

**Content (Scrollable):**
- Category chips (horizontal scroll, pill-shaped, gradient backgrounds)
- Grid layout: 2 columns of aesthetic cards
- Each card: image overlay, glassmorphic bottom section with text

**Safe area insets:**
- Top: headerHeight + 32px
- Bottom: tabBarHeight + 32px

### 4. Profile Screen
**Purpose:** User profile and settings

**Header:**
- Transparent
- Title: "Profile"
- Right button: Settings gear icon

**Content (Scrollable):**
- Circular avatar (120px, gradient border, centered)
- Display name (centered, H2)
- Stats cards (horizontal row, glassmorphic, showing dummy metrics)
- Settings list: theme toggle, notifications, about
- Each list item: icon, label, chevron, with glass background

**Safe area insets:**
- Top: headerHeight + 32px
- Bottom: tabBarHeight + 32px

---

## Animation Specifications
**Screen transitions:** Fade + slide (300ms, easeInOut)
**Card entry:** Stagger fade-in from bottom (150ms delay each)
**FAB:** Rotate on press (360° with spring)
**List items:** Scale on press (0.98)
**Theme toggle:** Smooth cross-fade (400ms)

Use Reanimated for all animations to ensure 60fps performance.

---

## Assets Required
- App logo (centered icon for splash, modern/abstract design)
- Category images (6 placeholder images for Explore grid)
- Profile avatar placeholder (gradient circle with initials)

Use Feather icons from @expo/vector-icons for all UI icons.