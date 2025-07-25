# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Learn Irish is a SvelteKit web application that helps Celtic flute players learn Irish tunes from hatao's YouTube playlist. It features tune browsing, practice tracking, and progress monitoring with Firebase backend integration.

## Essential Commands

### Development

```bash
npm run dev          # Start development server on port 5175
npm run build        # Build for production (static site)
npm run preview      # Preview production build
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run check        # Run svelte-check for TypeScript errors
```

### Firebase Deployment

```bash
npm run deploy:rules     # Deploy Firestore security rules
npm run deploy:hosting   # Deploy to Firebase hosting
npm run deploy:all       # Deploy both rules and hosting
```

### Testing

```bash
npm test             # Run Vitest tests
```

## Architecture

### Directory Structure

- `/src/core/` - Core services and business logic
  - `auth/` - Firebase authentication services
  - `repositories/` - Firestore data repositories
  - `i18n/` - Internationalization setup
  - `stores/` - Svelte stores for state management
  - `utils/` - Utility functions and helpers

- `/src/lib/` - Reusable components only
  - `components/` - UI components (buttons, forms, etc.)
  - `layouts/` - Layout components
  - All other files (models, utils, etc.) should be placed in `/src/core/` instead

- `/src/routes/` - SvelteKit routes
  - Main tune listing page
  - Individual tune pages (`/tune/[id]`)
  - Authentication pages (`/signin`, `/signup`)
  - User data page (`/mydata`)

### Key Technical Patterns

1. **State Management**: Uses Svelte stores in `/src/core/stores/`
   - `authStore` - Authentication state
   - `userDataStore` - User practice data
   - `tuneStore` - Tune catalog data

2. **Data Access**: Repository pattern in `/src/core/repositories/`
   - All Firebase/Firestore operations go through repositories
   - Repositories return typed data using interfaces from `/src/core/models/`

3. **Internationalization**:
   - Uses svelte-i18n with languages in `/src/lib/i18n/`
   - Supports English and Japanese
   - Access translations via `$_()` in components

4. **Component Imports**: Uses path aliases
   - `$lib` → `/src/lib` (components only)
   - `$core` → `/src/core` (business logic, models, utils)

5. **Static Site Generation**:
   - Uses `@sveltejs/adapter-static` for Firebase hosting
   - All pages are prerendered
   - No server-side rendering

6. **Svelte 5 Runes**: Prioritize using Svelte 5 Runes for reactive state management
   - Use `$state()` for reactive variables instead of `let` when reactivity is needed
   - Use `$derived()` for computed values instead of reactive statements
   - Use `$effect()` for side effects instead of reactive statements
   - Use `$props()` for component props with better type safety
   - Migrate existing stores to Runes-based patterns where applicable
   - Prefer Runes over traditional Svelte stores for new components

7. **Event Handling**: Use modern Svelte event handling patterns
   - Use `onclick` instead of `on:click` for event handlers
   - Avoid `createEventDispatcher` - use modern Svelte event handling approaches

### Firebase Integration

- **Authentication**: Email/password authentication via Firebase Auth
- **Database**: Firestore with the following collections:
  - `users` - User profiles and settings
  - `tunes` - Tune catalog (imported from CSV)
  - `userTuneData` - User-specific practice data
  - `userStatistics` - Daily practice statistics

### Development Notes

- The app is client-side only (SPA) deployed to Firebase Hosting
- All environment variables for Firebase are in `src/lib/firebase.client.ts`
- Tune data is imported from `/static/tunes.csv`
- The app tracks two types of memorization: tune names and melodies
- Monthly statistics are cached to avoid recalculation

### Important Instructions

- **DO NOT run `npm run dev`**: The user typically has the development server already running. Instead of running the command, ask the user to verify functionality in their browser at localhost:5175
- When making changes that require testing, ask the user to check the results rather than attempting to start the development server
