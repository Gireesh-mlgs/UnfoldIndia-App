# Glassify - Premium Glassmorphic Mobile App

## Overview

Glassify is a premium mobile application built with React Native and Expo that showcases a beautiful glassmorphic UI design system. This is a UI showcase app with no authentication requirements, featuring local data storage and a modern, visually stunning interface with support for both light and dark themes. The app demonstrates advanced animation techniques, blur effects, and gradient designs across multiple screens including Home, Explore, Profile, and a floating action button.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React Native with Expo SDK 54
- **New Architecture Enabled**: Utilizes React Native's new architecture for improved performance
- **React Compiler**: Experimental React compiler enabled for optimizations
- **Navigation**: React Navigation v7 with native stack and bottom tab navigators
- **State Management**: React Context API for theme management, TanStack Query for server state
- **Animations**: React Native Reanimated for smooth, native-thread animations
- **UI Components**: Custom glassmorphic components with blur effects using expo-blur

**Design System**:
- **Theme System**: Context-based theme provider with AsyncStorage persistence supporting light/dark modes
- **Color Palette**: Gradient-focused design with purple-blue, purple-pink, blue-cyan, and neon accent gradients
- **Glassmorphism**: Semi-transparent backgrounds with blur effects for iOS and fallback solid colors for Android
- **Typography**: Predefined type scale (h1-h4, body, small, link) with consistent styling
- **Spacing & Layout**: Standardized spacing tokens (xs to xxl) and border radius values

**Component Architecture**:
- Themed components (ThemedView, ThemedText) that automatically adapt to light/dark mode
- Reusable glass cards, gradient buttons, category chips with spring-based animations
- Custom tab bar with elevated floating action button (FAB) with glow effects
- Platform-aware components (KeyboardAwareScrollView with web fallback)

**Navigation Structure**:
```
RootStack
├── Splash (Auto-transitions after animation)
└── MainTabs
    ├── HomeTab (Home Stack)
    ├── ExploreTab (Explore Stack)
    ├── ActionTab (Floating Action Button Screen)
    └── ProfileTab (Profile Stack)
```

**Screens**:
- **Splash**: Animated logo with gradient background, auto-navigates to main tabs
- **Home**: Trending items carousel, recommended items grid, animated card reveals
- **Explore**: Search bar, category filters, grid layout with staggered animations
- **Profile**: User avatar, stats cards, settings items with theme toggle
- **Action**: Placeholder screen for create functionality

**Animation Strategy**:
- Shared values with spring physics for press interactions
- Staggered entrance animations with delays based on item index
- Scale, opacity, and translation transforms for smooth transitions
- Haptic feedback integration for enhanced user interaction

### Backend Architecture

**Server Framework**: Express.js with TypeScript
- **Development Mode**: Hot-reloading with tsx
- **Production Build**: esbuild bundling with ESM format
- **CORS Configuration**: Dynamic origin handling for Replit domains
- **API Structure**: Modular route registration pattern (currently empty, ready for endpoints)

**Data Layer**:
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: User table with username/password fields, UUID primary keys
- **Storage Interface**: Abstracted IStorage interface with in-memory implementation (MemStorage)
- **Validation**: Zod schemas for runtime type validation derived from Drizzle schemas

**Development Setup**:
- Module resolution aliases (@, @shared) for clean imports
- Separate development and production npm scripts
- Static build process for Expo web deployments
- Environment-based configuration (Replit domain handling)

### External Dependencies

**UI & Animation Libraries**:
- `expo-blur`: Blur effects for glassmorphic design (iOS native, Android fallback)
- `expo-linear-gradient`: Multi-stop gradient backgrounds
- `react-native-reanimated`: Native-thread animations with worklets
- `react-native-gesture-handler`: Advanced gesture recognition
- `@expo/vector-icons`: Icon library (Feather icons primarily used)
- `expo-image`: Optimized image component with caching

**Navigation**:
- `@react-navigation/native`: Core navigation library
- `@react-navigation/native-stack`: Native stack navigator
- `@react-navigation/bottom-tabs`: Bottom tab navigation with custom tab bar
- `react-native-safe-area-context`: Safe area handling for notched devices
- `react-native-screens`: Native screen optimization

**Data & State**:
- `@tanstack/react-query`: Server state management and caching
- `@react-native-async-storage/async-storage`: Persistent local storage for theme preference
- `drizzle-orm`: Type-safe ORM with PostgreSQL dialect
- `drizzle-zod`: Zod schema generation from Drizzle schemas
- `pg`: PostgreSQL client library

**Developer Experience**:
- `tsx`: TypeScript execution for server development
- `babel-preset-expo`: Babel configuration for Expo
- `module-resolver`: Path alias resolution in Babel
- `react-native-keyboard-controller`: Keyboard handling for forms
- `expo-haptics`: Tactile feedback for interactions

**Platform Support**:
- iOS: Full glassmorphic effects with native blur
- Android: Edge-to-edge display, adaptive icons, fallback blur rendering
- Web: Single-page output, react-native-web compatibility

**Database**:
- PostgreSQL (configured via DATABASE_URL environment variable)
- Drizzle Kit for migrations and schema management
- Migration files stored in `/migrations` directory

**Third-party Integrations**:
- Expo services (splash screen, status bar, web browser, system UI, fonts, constants, linking)
- Picsum Photos: Mock image service for demonstration data