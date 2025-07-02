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

- `/src/lib/` - Reusable components
  - `components/` - UI components (buttons, forms, etc.)
  - `layouts/` - Layout components
  - `models/` - TypeScript interfaces and types

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
   - Repositories return typed data using interfaces from `/src/lib/models/`

3. **Internationalization**: 
   - Uses svelte-i18n with languages in `/src/lib/i18n/`
   - Supports English and Japanese
   - Access translations via `$_()` in components

4. **Component Imports**: Uses path aliases
   - `$lib` → `/src/lib`
   - `$core` → `/src/core`
   - `$models` → `/src/lib/models`

5. **Static Site Generation**:
   - Uses `@sveltejs/adapter-static` for Firebase hosting
   - All pages are prerendered
   - No server-side rendering

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