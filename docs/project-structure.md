# Learn Irish Project Structure

This document provides an overview of the project's directory structure and the purpose of each component.

## Root Directory

- `.firebaserc` - Firebase project configuration
- `.github/` - GitHub workflow and configuration files
- `.gitignore` - Specifies files ignored by Git
- `.npmrc` - NPM configuration
- `.prettierignore` - Files to be ignored by Prettier
- `.prettierrc` - Prettier code formatter configuration
- `.svelte-kit/` - Build artifacts for SvelteKit
- `README.md` - Project overview and setup instructions
- `build/` - Production build output
- `eslint.config.js` - ESLint configuration
- `firebase.json` - Firebase service configuration
- `firestore.indexes.json` - Firestore indexes configuration
- `firestore.rules` - Firestore security rules
- `node_modules/` - External dependencies installed via npm
- `package-lock.json` - Exact dependency versions
- `package.json` - Project metadata and dependencies
- `postcss.config.js` - PostCSS configuration
- `public/` - Static assets served directly
- `src/` - Source code
- `static/` - Static assets that are processed during build
- `svelte.config.js` - SvelteKit configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite bundler configuration

## Source Code Structure

The `src/` directory contains the application source code:

- `app.css` - Global CSS styles
- `app.d.ts` - TypeScript declaration file
- `app.html` - HTML template
- `core/` - Core modules and services
  - `auth/` - Authentication-related logic
    - `authService.ts` - Authentication service
    - `userService.ts` - User management service
  - `config/` - Configuration services
    - `configService.ts` - Application configuration
  - `data/` - Data access layer
    - `firebase/` - Firebase integration
      - `firebaseClient.ts` - Firebase client configuration
    - `models/` - Data models
      - `Tune.ts` - Tune data model
      - `UserTune.ts` - User-specific tune data model
    - `repositories/` - Data repositories
      - `favoritesRepository.ts` - Favorites management
      - `statisticsRepository.ts` - Statistics management
      - `tuneRepository.ts` - Tune data management
  - `i18n/` - Internationalization
    - `i18nService.ts` - i18n service
    - `locales/` - Localization files
  - `store/` - State management
    - `userStore.ts` - User state management
  - `utils/` - Utility functions
    - `dateUtils.ts` - Date-related utilities
    - `youtubeUtils.ts` - YouTube-related utilities
- `lib/` - Reusable components and utilities
  - `assets/` - Static assets used by components
  - `button/` - Button components
  - `forms/` - Form-related components
  - `images/` - Image assets and image-related components
  - `layout/` - Layout components
  - `tune/` - Components related to music/tunes
  - `ui/` - UI components
  - `utils/` - Utility functions
    - `cacheStorage.ts` - Cache storage utilities
    - `errorHandling.ts` - Error handling utilities
- `modules/` - Legacy feature modules (being migrated to core/)
- `routes/` - SvelteKit routes (pages)
- `types/` - TypeScript type definitions

## Documentation

The `docs/` directory contains project documentation:

- `project-structure.md` - This file, documenting the project structure
- `folder-structure-improvements.md` - Documentation of folder structure improvements
- `technical-debt.md` - Documentation of technical debt

## Development Workflow

This project is built with SvelteKit. To develop:

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`
4. Preview production build: `npm run preview`

For more information, refer to the project README.md file.

## Folder Structure Improvements

The project is undergoing a gradual refactoring of its folder structure following these principles:

1. **Consistent folder structure** - Organizing code into logical groups
2. **Naming conventions**:
   - Components: PascalCase + `.svelte` (e.g., `Button.svelte`)
   - Component directories: Plural form (e.g., `buttons/`)
   - Utilities/Services: camelCase + `.ts` (e.g., `dateUtils.ts`)
   - Modules: Noun-based names that clearly indicate functionality (e.g., `tuneRepository.ts`)
   - Type definitions: PascalCase (e.g., `Tune.ts`)

3. **File placement**:
   - Page components: In their corresponding route directory
   - Shared components: Under `lib/components/` organized by functionality
   - Business logic: Under `core/` or `app/services/` organized by functionality
   - Data access: Under `core/data/` using repository pattern
   - Utility functions: Under `lib/utils/` categorized by function
   - Type definitions: Common types under `types/`, feature-specific types in their respective module directories

The migration is being done gradually, with the first phase focusing on moving modules to the new `core/` directory structure.
