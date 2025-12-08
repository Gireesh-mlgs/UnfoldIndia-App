# Design Guidelines: Unfold India

## Brand Overview
**App Name:** Unfold India  
**Tagline:** Discover India's hidden gems  
**Tone:** Warm, curious, helpful, and slightly playful  
**Focus:** Travel discovery app focused on India, with current emphasis on Delhi & Delhi NCR

---

## Color Palette

### Primary Colors
- **Saffron/Marigold:** `#F5A623` (primary accent, CTAs, active states)
- **Deep Navy/Indigo:** `#24314A` (contrast, headers, text)
- **Warm Ivory:** `#FFFBF5` (light mode background)
- **Slate Gray:** `#64748B` (secondary text, subtle elements)

### Semantic Colors
- **Success:** `#22C55E`
- **Warning:** `#F59E0B`
- **Error:** `#EF4444`

### Light Mode
- Background: Warm ivory `#FFFBF5`
- Card backgrounds: Semi-transparent white with blur
- Text primary: Navy `#24314A`
- Text secondary: `#6B7280`

### Dark Mode
- Background: Deep navy `#0F172A`
- Card backgrounds: Semi-transparent dark with blur
- Text primary: `#F9FAFB`
- Text secondary: `#9CA3AF`

### Gradients
- **Saffron Gold:** `['#F5A623', '#D4890F']`
- **Saffron Warm:** `['#F5A623', '#FF6B35']`
- **Navy Indigo:** `['#24314A', '#1E3A5F']`
- **Hero Overlay:** `['rgba(36, 49, 74, 0.7)', 'rgba(36, 49, 74, 0.3)']`

---

## Typography

### Scale
- **H1:** 32px, Bold - Major headings
- **H2:** 24px, SemiBold - Section titles
- **H3:** 20px, Medium - Subsections
- **H4:** 18px, Medium - Card titles
- **Body:** 16px, Regular - Main content
- **Small:** 14px, Regular - Secondary info
- **Caption:** 12px, Regular - Labels, timestamps

---

## Navigation

### Bottom Tab Bar (5 tabs)
1. **Explore** (compass icon) - Home/discover
2. **Route** (map-pin icon) - Map & planner
3. **Chat** (message-circle icon) - AI travel assistant
4. **Recommendations** (heart icon) - Personalized feed
5. **Profile** (user icon) - Saved places & settings

Active tab: Saffron accent color `#F5A623`
Tab bar: Blurred background on iOS, solid on Android

### Global Search Bar
- Persistent at top of main screens
- Placeholder: "Search Delhi, monuments, cafes, trails..."
- Voice input icon on right
- Soft shadow with subtle navy tint

---

## Card & Component Specifications

### Place Cards
- Border radius: 16-20px
- Soft shadow (elevation 6)
- Image with gradient overlay at bottom
- Title, subtitle, rating, distance
- Quick action icons (save, route, share)
- "Hidden Gem" badge with star icon (if applicable)

### Glass Cards
- Semi-transparent background with blur
- Border: 1px solid rgba(255, 255, 255, 0.2)
- Blur intensity: 20-40
- Border radius: 20px minimum

### Buttons
- Primary: Saffron gradient background
- Border radius: 12-16px
- Height: 52px for main CTAs
- Soft glow shadow matching saffron

### Chips/Tags
- Pill-shaped (border radius full)
- Category-specific colors
- Padding: 8px 16px

### Badges
- "Hidden Gem" - Star icon with gold accent
- "Local Pick" - Map pin with saffron
- Small, positioned top-right of cards

---

## Screen Specifications

### 1. Onboarding (3 screens)
**Screen 1:** Welcome
- Full-bleed hero image (Delhi skyline) with dark gradient overlay
- "Unfold India" title with tagline
- CTA: "Get Started"

**Screen 2:** Features
- Brief intro to: Explore / Routes / AI Chatbot / Personalized Picks
- Simple illustrations or icons for each

**Screen 3:** Permissions
- Location permission request
- Interest preferences (food, culture, outdoors, nightlife)
- CTA: "Enable & Continue"

### 2. Explore (Home)
**Header:**
- Greeting text with time-based message
- Global search bar
- Location chip (Delhi NCR) + filter button

**Content:**
- Hero carousel: "Top Picks Today" horizontal scroll
- Sections: "Hidden Gems Near You", "Local Picks by Neighborhood", "Weekend Escapes"
- Each section with horizontal scroll cards
- Floating "Nearby" button opens map

### 3. Place Detail
- Large parallax hero image with gradient overlay
- Info chips: Category, hours, best time, entry fee
- Quick actions row: Save, Route, Call, Share
- "Why it's a hidden gem" blurb with Local Tip
- Reviews section
- Similar places carousel

### 4. Route (Map & Planner)
- Fullscreen map with clustered pins
- Collapsible planner panel (drag up)
- Add stops, choose transport mode
- Sample routes with estimated times
- Start navigation / Save route buttons

### 5. Chat (AI Assistant)
- Conversational UI with message bubbles
- Header: "UnfoldBot" avatar
- Quick prompts above keyboard
- Support buttons: Show on map, Add to route, Save place

### 6. Recommendations Feed
- AI-driven personalized cards
- Explanation text: "Because you liked..." or "Popular with locals"
- Filter toggles: Hidden gems only, Family-friendly, Budget
- "Local Stories" micro-articles

### 7. Profile / Saved
- Tabs: Saved Places, My Routes, Preferences, Help & About
- Settings: Region preference, privacy, notifications, language

---

## Animations & Interactions

- Card press: Scale to 0.98 with spring
- FAB: Rotate on press with spring animation
- Screen transitions: 300ms ease-out
- Heart/save toggle: Burst animation
- List items: Staggered fade-in on load
- Loading states: Skeleton placeholders

---

## Spacing System
- XS: 4px
- SM: 8px
- MD: 16px
- LG: 24px
- XL: 32px
- 2XL: 48px

Use generous spacing - minimum 16px padding inside cards, 24px between major sections.

---

## Iconography
Use Feather icons from @expo/vector-icons:
- Rounded, simple line style
- Size 24px for standard, 20px for smaller contexts
- Accent icons for badges (star, map-pin)

---

## Category Colors
- **Food:** `#F5A623` to `#FF6B35`
- **Culture:** `#8B5CF6` to `#6366F1`
- **Nature:** `#22C55E` to `#10B981`
- **Nightlife:** `#EC4899` to `#F43F5E`
- **Shopping:** `#3B82F6` to `#06B6D4`
- **Experiences:** `#F59E0B` to `#EF4444`

---

## Sample Delhi/NCR Content

### Featured Neighborhoods
- Connaught Place
- Hauz Khas Village
- Mehrauli/Qutub
- Chandni Chowk (Old Delhi)
- Dilli Haat
- Lodhi Gardens
- Khan Market
- Gurugram Cyber Hub
- Noida Sector 18

### Hidden Gems Examples
- Nanha Park - Colonial-era pocket near Lodhi Garden
- Hauz Khas Hidden Alley - Rooftop cafes with lake view
- Stepwells of Mehrauli - Restored baolis off beaten path
- Paharganj Street Food Lane - Local favourites, budget-friendly
