# Vite Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate from Create React App + CRACO to Vite for faster builds and modern tooling

**Architecture:** Clean replacement approach - remove CRA/CRACO dependencies, add Vite + plugins, update configs, maintain all existing functionality with minimal source code changes

**Tech Stack:** Vite 5.x, @vitejs/plugin-react, @modyfi/vite-plugin-yaml, Jest (keeping existing tests)

---

## Task 1: Search and Document Environment Variable Usage

**Files:**

- Reference: `src/utils/photo.ts:9`
- Reference: `src/components/Footer.tsx:5`

**Step 1: Verify all env variable usage**

Run: `rg "process\.env\.REACT_APP" --type ts --type tsx --type js --type jsx`

Expected: Should find exactly 2 files:

- `src/utils/photo.ts` - uses `REACT_APP_MAX_PHOTO_KB`
- `src/components/Footer.tsx` - uses `REACT_APP_VERSION`

**Step 2: Document variables for migration**

Note the variables to migrate:

- `REACT_APP_MAX_PHOTO_KB` → `VITE_MAX_PHOTO_KB`
- `REACT_APP_VERSION` → `VITE_VERSION`

---

## Task 2: Remove CRA and CRACO Dependencies

**Files:**

- Modify: `package.json`

**Step 1: Remove deprecated dependencies**

Run:

```bash
npm uninstall react-scripts @craco/craco yaml-loader
```

Expected: Dependencies removed from package.json devDependencies section

**Step 2: Verify removal**

Run: `cat package.json | grep -E "(react-scripts|craco|yaml-loader)"`

Expected: No matches found

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove CRA and CRACO dependencies"
```

---

## Task 3: Install Vite and Plugins

**Files:**

- Modify: `package.json`

**Step 1: Install Vite dependencies**

Run:

```bash
npm install --save-dev vite @vitejs/plugin-react @modyfi/vite-plugin-yaml vite-plugin-environment
```

Expected: All 4 packages added to devDependencies in package.json

**Step 2: Verify installation**

Run: `npm list vite @vitejs/plugin-react @modyfi/vite-plugin-yaml vite-plugin-environment`

Expected: All packages listed with version numbers, no errors

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add Vite and related plugins"
```

---

## Task 4: Create Vite Configuration

**Files:**

- Create: `vite.config.ts`
- Delete: `craco.config.js`

**Step 1: Create vite.config.ts**

Create file at project root with content:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import EnvironmentPlugin from 'vite-plugin-environment';

export default defineConfig({
  plugins: [
    react(),
    ViteYaml(),
    EnvironmentPlugin({
      VITE_VERSION: null,
      VITE_NAME: null,
      VITE_REPO: null,
      VITE_MAX_PHOTO_KB: '100',
    }),
  ],
  base: '/family-grid/',
  build: {
    outDir: 'dist',
  },
});
```

**Step 2: Delete CRACO config**

Run: `rm craco.config.js`

Expected: File removed

**Step 3: Verify files**

Run: `ls -la vite.config.ts craco.config.js`

Expected: vite.config.ts exists, craco.config.js not found error

**Step 4: Commit**

```bash
git add vite.config.ts
git add -u craco.config.js
git commit -m "build: add Vite configuration and remove CRACO config"
```

---

## Task 5: Move and Update index.html

**Files:**

- Move: `public/index.html` → `index.html`
- Modify: `index.html`

**Step 1: Move index.html to root**

Run: `mv public/index.html index.html`

Expected: File moved to project root

**Step 2: Update index.html content**

Edit `index.html` to update the content:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta
      name="description"
      content="Family Grid - Create and manage family tree diagrams"
    />
    <link rel="manifest" href="/manifest.json" />
    <title>Family Grid</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

Changes made:

- Removed `%PUBLIC_URL%` from manifest link (Vite handles this)
- Added `<script type="module" src="/src/index.tsx"></script>` at end of body
- Updated meta description

**Step 3: Verify HTML file**

Run: `cat index.html | grep "type=\"module\""`

Expected: Should find the module script tag

**Step 4: Commit**

```bash
git add index.html
git commit -m "refactor: move and update index.html for Vite"
```

---

## Task 6: Update Environment Variables in Source Code

**Files:**

- Modify: `src/utils/photo.ts:9`
- Modify: `src/components/Footer.tsx:5`

**Step 1: Update photo.ts**

Edit `src/utils/photo.ts` line 9:

Change:

```typescript
return parseInt(process.env.REACT_APP_MAX_PHOTO_KB || '100', 10);
```

To:

```typescript
return parseInt(import.meta.env.VITE_MAX_PHOTO_KB || '100', 10);
```

**Step 2: Update Footer.tsx**

Edit `src/components/Footer.tsx` line 5:

Change:

```typescript
const version = process.env.REACT_APP_VERSION as string;
```

To:

```typescript
const version = import.meta.env.VITE_VERSION as string;
```

**Step 3: Verify no remaining process.env usage**

Run: `rg "process\.env\.REACT_APP" src/`

Expected: No matches found

**Step 4: Commit**

```bash
git add src/utils/photo.ts src/components/Footer.tsx
git commit -m "refactor: update environment variables to Vite format"
```

---

## Task 7: Update .env.example

**Files:**

- Modify: `.env.example`

**Step 1: Update environment variable names**

Edit `.env.example`:

Change:

```
REACT_APP_VERSION=$npm_package_version
REACT_APP_NAME=$npm_package_name
REACT_APP_REPO=$npm_package_repository
REACT_APP_MAX_PHOTO_KB=100
```

To:

```
VITE_VERSION=$npm_package_version
VITE_NAME=$npm_package_name
VITE_REPO=$npm_package_repository
VITE_MAX_PHOTO_KB=100
```

**Step 2: Verify changes**

Run: `cat .env.example`

Expected: All variables should have `VITE_` prefix

**Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: update .env.example to use VITE_ prefix"
```

---

## Task 8: Add Vite Type Definitions

**Files:**

- Create: `src/vite-env.d.ts`

**Step 1: Create Vite environment type definitions**

Create `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VERSION: string;
  readonly VITE_NAME: string;
  readonly VITE_REPO: string;
  readonly VITE_MAX_PHOTO_KB: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

**Step 2: Verify file created**

Run: `cat src/vite-env.d.ts`

Expected: File content matches above

**Step 3: Commit**

```bash
git add src/vite-env.d.ts
git commit -m "chore: add Vite type definitions"
```

---

## Task 9: Update TypeScript Configuration

**Files:**

- Modify: `tsconfig.json`

**Step 1: Add Vite types to tsconfig.json**

Edit `tsconfig.json`, update the `compilerOptions` section:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

Changes:

- Updated `target` from `es5` to `ES2020`
- Added `useDefineForClassFields: true`
- Updated `lib` to include `ES2020`
- Changed `moduleResolution` from `node` to `bundler`
- Added `types: ["vite/client"]`

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

Expected: No errors (or only unrelated errors from existing code)

**Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "build: update TypeScript config for Vite"
```

---

## Task 10: Update .gitignore

**Files:**

- Modify: `.gitignore`

**Step 1: Update build output folder**

Edit `.gitignore` line 12:

Change:

```
/build
```

To:

```
/dist
```

**Step 2: Verify changes**

Run: `cat .gitignore | grep -E "(build|dist)"`

Expected: Should show `/dist` but not `/build`

**Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: update .gitignore to use dist folder"
```

---

## Task 11: Update npm Scripts

**Files:**

- Modify: `package.json`

**Step 1: Update scripts section**

Edit `package.json` scripts:

Change:

```json
"scripts": {
  "start": "craco start",
  "build": "craco build",
  "test": "craco test",
  "eject": "react-scripts eject"
}
```

To:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "react-scripts test"
}
```

Note: Keep `react-scripts test` for now to maintain Jest testing

**Step 2: Verify scripts**

Run: `npm run --list`

Expected: Should list dev, build, preview, test scripts

**Step 3: Commit**

```bash
git add package.json
git commit -m "build: update npm scripts for Vite"
```

---

## Task 12: Test Development Server

**Step 1: Start dev server**

Run: `npm run dev`

Expected:

- Vite dev server starts
- Shows URL like `http://localhost:5173`
- No errors in terminal

**Step 2: Open in browser**

Navigate to the URL shown (e.g., `http://localhost:5173`)

Expected:

- App loads successfully
- No console errors in browser DevTools
- Family Grid interface appears

**Step 3: Test basic functionality**

Manual tests:

- Diagram renders correctly
- Can add/edit family members (test modals)
- Language switching works (EN ↔ ID)
- YAML import/export works

**Step 4: Stop dev server**

Press Ctrl+C in terminal

Expected: Server stops cleanly

---

## Task 13: Test Production Build

**Step 1: Run production build**

Run: `npm run build`

Expected:

- Build completes successfully
- Creates `dist/` folder
- Shows build stats (file sizes)
- No errors

**Step 2: Verify dist folder structure**

Run: `ls -la dist/`

Expected:

- `index.html` exists
- `assets/` folder with JS/CSS bundles
- `manifest.json` exists
- `robots.txt` exists

**Step 3: Preview production build**

Run: `npm run preview`

Expected:

- Preview server starts
- Shows URL with `/family-grid/` base path
- Opens successfully

**Step 4: Test production build in browser**

Navigate to preview URL

Expected:

- App loads with all features working
- All assets load correctly (check Network tab)
- No console errors
- Version number appears in footer

**Step 5: Stop preview server**

Press Ctrl+C in terminal

---

## Task 14: Run Test Suite

**Step 1: Run all tests**

Run: `npm test -- --watchAll=false`

Expected:

- All existing tests pass
- No new test failures
- Test runner exits cleanly

**Step 2: Check test coverage (if failing)**

If tests fail, identify the failures:

Run: `npm test -- --watchAll=false --verbose`

Expected: Detailed output showing which tests failed and why

**Note:** If tests fail due to environment variables or module loading, this is expected and needs troubleshooting. Stop and inform the user.

---

## Task 15: Update README.md

**Files:**

- Modify: `README.md`

**Step 1: Update development instructions**

Edit `README.md`, update the Installation and Available Scripts sections:

Change installation section (~line 34-40):

````markdown
## Installation

Run the app in the development mode.

```sh
npm start
```
````

Open [http://localhost:3000](http://localhost:3000) to open app in the browser.

````

To:
```markdown
## Installation

Install dependencies:

```sh
npm install
````

Run the app in development mode:

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

````

Change Available Scripts section (~line 42-58):
```markdown
## Available Scripts

In the project directory, you can run:

### `npm test`

Launches the test runner in the interactive watch mode. See the section about
[running tests](https://facebook.github.io/create-react-app/docs/running-tests)
for more information.

### `npm run build`

Builds the app for production to the `build` folder. It correctly bundles React
in production mode and optimizes the build for the best performance. The build
is minified and the filenames include the hashes. See the section about
[deployment](https://facebook.github.io/create-react-app/docs/deployment) for
more information.
````

To:

```markdown
## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode with Vite's fast HMR (Hot Module Replacement).
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### `npm run build`

Builds the app for production to the `dist` folder using Vite. The build is
optimized, minified, and includes content hashes in filenames.

### `npm run preview`

Locally preview the production build. Run `npm run build` first.

### `npm test`

Launches the test runner in interactive watch mode using Jest and React Testing Library.
```

**Step 2: Verify changes**

Run: `cat README.md | grep -A 2 "npm run dev"`

Expected: Should show the new dev script documentation

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README for Vite migration"
```

---

## Task 16: Update CHANGELOG.md

**Files:**

- Modify: `CHANGELOG.md`

**Step 1: Add Unreleased section**

Edit `CHANGELOG.md`, add new entry at the top (after the header):

```markdown
## [Unreleased]

### Changed

- Migrated from Create React App to Vite for faster builds and modern tooling
- Build output folder changed from `build/` to `dist/`
- Development server command changed from `npm start` to `npm run dev`
- Environment variables now use `VITE_` prefix instead of `REACT_APP_`
- Updated npm scripts: added `dev` and `preview` commands

### Removed

- Removed deprecated Create React App and CRACO dependencies
- Removed `npm start` script (use `npm run dev` instead)
```

**Step 2: Verify changes**

Run: `head -20 CHANGELOG.md`

Expected: Should show the new Unreleased section at the top

**Step 3: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: update CHANGELOG for Vite migration"
```

---

## Task 17: Final Verification

**Step 1: Verify git status is clean**

Run: `git status`

Expected: "working tree clean" or only untracked files like `.env`

**Step 2: Review all commits**

Run: `git log --oneline -15`

Expected: Should see all migration commits with proper conventional commit messages

**Step 3: Verify no deprecation warnings**

Run: `npm run dev`

Check terminal output for warnings

Expected:

- No `DEP0176` warning about fs.F_OK
- No browserslist warnings
- Clean Vite startup

**Step 4: Final smoke test**

With dev server running, test in browser:

1. ✅ App loads without errors
2. ✅ Diagram renders
3. ✅ Can add/edit/delete family members
4. ✅ YAML import/export works
5. ✅ Language switching works (EN ↔ ID)
6. ✅ Version displays in footer
7. ✅ Photo upload works (tests VITE_MAX_PHOTO_KB env var)

**Step 5: Stop dev server and complete**

Press Ctrl+C

---

## Success Criteria Checklist

Before considering the migration complete, verify:

- ✅ All CRA dependencies removed
- ✅ Vite and plugins installed correctly
- ✅ `vite.config.ts` created and working
- ✅ `index.html` moved to root and updated
- ✅ All environment variables migrated to `VITE_` prefix
- ✅ TypeScript compiles without errors (`tsc --noEmit`)
- ✅ Development server runs (`npm run dev`)
- ✅ Production build succeeds (`npm run build`)
- ✅ Production preview works (`npm run preview`)
- ✅ All tests pass (`npm test`)
- ✅ No deprecation warnings in console
- ✅ All features work in browser
- ✅ Documentation updated (README, CHANGELOG)
- ✅ All changes committed with conventional commits

---

## Troubleshooting

### If YAML imports fail

- Check `vite.config.ts` has `ViteYaml()` plugin
- Verify `data.yml` file exists in `src/`
- Check browser console for import errors

### If environment variables are undefined

- Verify `.env` file exists (copy from `.env.example`)
- Check variables have `VITE_` prefix
- Restart dev server after changing `.env`

### If tests fail

- This is expected - Jest may need additional Vite configuration
- Stop and inform user - tests may need separate migration strategy
- Consider migrating to Vitest in future

### If assets 404 on GitHub Pages

- Verify `base: '/family-grid/'` in `vite.config.ts`
- Check `dist/` folder is deployed, not `build/`
- Test with `npm run preview` first

---

## Notes for Implementation

- **Stop immediately if critical issues occur** - inform user, don't auto-fix
- Each task is independent and can be verified before proceeding
- Commits should be atomic - one logical change per commit
- Test frequently - don't batch multiple tasks before testing
- Keep existing `.env` file (not tracked in git) - it should work if renamed variables match

---

## Post-Migration Tasks (Optional, Future)

These are NOT part of this migration plan:

- Migrate from Jest to Vitest
- Update GitHub Actions for automated deployment
- Optimize bundle size with code splitting
- Add PWA support with Vite PWA plugin
- Migrate to React Router (if needed)
