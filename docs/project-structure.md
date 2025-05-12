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
- `lib/` - Reusable components and utilities
  - `assets/` - Static assets used by components
  - `button/` - Button components
  - `forms/` - Form-related components
  - `images/` - Image assets and image-related components
  - `layout/` - Layout components
  - `tune/` - Components related to music/tunes
- `locales/` - Internationalization files
- `modules/` - Feature modules
- `routes/` - SvelteKit routes (pages)
- `types/` - TypeScript type definitions

## Documentation

The `docs/` directory contains project documentation:

- `project-structure.md` - This file, documenting the project structure

## Development Workflow

This project is built with SvelteKit. To develop:

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`
4. Preview production build: `npm run preview`

For more information, refer to the project README.md file.