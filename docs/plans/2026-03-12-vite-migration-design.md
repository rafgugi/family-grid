# Vite Migration Design

**Date:** 2026-03-12  
**Status:** Approved  
**Author:** OpenCode

## Problem / Motivation

Create React App (CRA) is officially deprecated by the React team as of 2021. The project currently uses `react-scripts@5.0.1` which is no longer maintained, leading to:

- Deprecation warnings (e.g., `DEP0176: fs.F_OK is deprecated`)
- Outdated dependencies with no security patches
- Slower build times compared to modern tooling
- No future bug fixes or improvements

The React team now recommends using modern frameworks like Vite for new projects. Migrating to Vite will future-proof the project and provide immediate benefits including faster builds, better developer experience, and active maintenance.

## Proposed Solution

Migrate from Create React App + CRACO to Vite using a clean replacement approach. This involves:

1. Removing CRA/CRACO dependencies and adding Vite
2. Replacing webpack-based YAML loader with Vite plugin
3. Updating environment variables from `REACT_APP_*` to `VITE_*` format
4. Moving and updating `index.html` to follow Vite conventions
5. Updating configuration files and npm scripts
6. Keeping Jest for testing (minimal changes)
7. Maintaining GitHub Pages deployment with new `dist/` output folder

**Why Approach 1 (Clean Migration):**

- Project is well-structured with minimal webpack customization (only YAML loader)
- Complete removal of deprecated tooling eliminates all warnings
- Vite provides significant performance improvements
- One-time migration effort vs. ongoing maintenance burden

## Architecture Changes

### Before (CRA)

```
Build Tool: Create React App 5.0.1
├── Bundler: webpack (via react-scripts)
├── Custom Config: CRACO for webpack modifications
├── YAML Loading: yaml-loader (webpack plugin)
├── Env Vars: REACT_APP_* prefix
├── HTML: public/index.html with %PUBLIC_URL%
└── Output: build/
```

### After (Vite)

```
Build Tool: Vite 5.x
├── Bundler: Rollup (production) / ESM (dev)
├── Custom Config: vite.config.ts
├── YAML Loading: @modyfi/vite-plugin-yaml
├── Env Vars: VITE_* prefix
├── HTML: index.html at root with module script
└── Output: dist/
```

## Dependencies

### Remove (devDependencies)

- `react-scripts@5.0.1` - CRA core
- `@craco/craco@7.1.0` - Webpack customization layer
- `yaml-loader@0.8.0` - Webpack-specific YAML loader

### Add (devDependencies)

- `vite@^5.0.0` - Core build tool
- `@vitejs/plugin-react@^4.2.0` - React support with Fast Refresh
- `@modyfi/vite-plugin-yaml@^1.1.0` - YAML file import support
- `vite-plugin-environment@^1.1.3` - npm package variable support

**Rationale:** All build tools are development-only dependencies. Runtime dependencies (React, Bootstrap, GoJS, etc.) remain unchanged.

## Configuration Files

### New Files

**`vite.config.ts`** (project root)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import yaml from '@modyfi/vite-plugin-yaml';

export default defineConfig({
  plugins: [react(), yaml()],
  base: '/family-grid/', // GitHub Pages subpath
  build: {
    outDir: 'dist',
  },
});
```

### Modified Files

**`index.html`** (move from public/ to root)

- Remove `%PUBLIC_URL%` references (Vite resolves paths automatically)
- Add: `<script type="module" src="/src/index.tsx"></script>`
- Keep manifest.json and meta tags

**`package.json`**

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "react-scripts test"
}
```

**`.env.example`**

```
VITE_VERSION=$npm_package_version
VITE_NAME=$npm_package_name
VITE_REPO=$npm_package_repository
VITE_MAX_PHOTO_KB=100
```

**`.gitignore`**

- Change `/build` to `/dist`

**`tsconfig.json`**

- May need to add `"types": ["vite/client"]` for import.meta.env types

### Deleted Files

- `craco.config.js` - No longer needed

## Source Code Changes

### Environment Variables

Search and replace all occurrences:

- `process.env.REACT_APP_` → `import.meta.env.VITE_`

Files likely affected:

- Components that display version/name/repo info
- Configuration files that reference max photo size

### Type Definitions

May need to add Vite client types to `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />
```

## Testing Strategy

**Keep Jest** - Minimize migration risk by retaining existing test infrastructure

- All existing tests continue to work unchanged
- Jest config from react-scripts still applies
- Can migrate to Vitest later as separate task

**Verification Steps:**

1. `npm test` - All tests pass
2. `npm run build` - Production build succeeds
3. `npm run preview` - Preview built app locally
4. Manual testing: diagram rendering, YAML import/export, i18n switching

## GitHub Pages Deployment

**Changes Required:**

- Build output changes from `build/` to `dist/`
- Base path configured in vite.config.ts: `/family-grid/`
- Update any manual deployment scripts to use `dist/` folder
- `.gitignore` updated to ignore `dist/` instead of `build/`

**No CI/CD Changes:**

- Existing `.github/workflows/test.yml` only runs tests (no deployment)
- Manual deployment process continues, just using new `dist/` folder

## Risk Mitigation

### Potential Issues

1. **YAML loading differences**

   - Risk: Vite plugin might parse YAML differently than webpack loader
   - Mitigation: Test data.yml import in index.tsx immediately
   - Verification: Confirm rawFamilyData structure matches expected format

2. **Environment variable access**

   - Risk: Missing env variable replacements breaks runtime features
   - Mitigation: Grep for all `process.env` usage before migration
   - Verification: Check version/name/repo display in UI

3. **Asset path resolution**

   - Risk: manifest.json, robots.txt might not load correctly
   - Mitigation: Test public folder assets after migration
   - Verification: Check browser console for 404 errors

4. **TypeScript type errors**

   - Risk: Vite types conflict with CRA types
   - Mitigation: Update tsconfig.json, add vite/client types
   - Verification: Run `tsc --noEmit` to check types

5. **GitHub Pages base path**
   - Risk: Incorrect base path breaks routing and assets
   - Mitigation: Test with `npm run preview` before deployment
   - Verification: All assets load with `/family-grid/` prefix

### Rollback Plan

If critical issues occur during migration:

1. **Stop immediately** - Do not attempt automatic fixes
2. **Inform user** - Report the issue and wait for instructions
3. **Git rollback available** - All commits are atomic and reversible

```bash
git log --oneline  # Find commit to rollback to
git reset --hard <commit-hash>
npm install        # Restore dependencies
```

## Success Criteria

✅ All tests pass (`npm test`)  
✅ Production build succeeds (`npm run build`)  
✅ Dev server runs (`npm run dev`)  
✅ Production preview works (`npm run preview`)  
✅ No deprecation warnings in console  
✅ YAML data loads correctly  
✅ Environment variables accessible  
✅ Internationalization works (EN/ID)  
✅ GoJS diagram renders properly  
✅ All features work as before migration

## Implementation Phases

Each phase gets a conventional commit:

1. **Phase 1: Dependency Cleanup**

   - Remove CRA/CRACO dependencies
   - Commit: `chore: remove CRA and CRACO dependencies`

2. **Phase 2: Add Vite**

   - Install Vite and plugins
   - Commit: `chore: add Vite and related plugins`

3. **Phase 3: Configuration**

   - Create vite.config.ts
   - Delete craco.config.js
   - Commit: `build: add Vite configuration file`

4. **Phase 4: HTML Update**

   - Move and update index.html
   - Commit: `refactor: move and update index.html for Vite`

5. **Phase 5: Environment Variables**

   - Update .env.example
   - Update source code references
   - Commit: `refactor: update environment variables to Vite format`

6. **Phase 6: Scripts & Config**

   - Update package.json scripts
   - Update .gitignore
   - Update tsconfig.json if needed
   - Commit: `build: update npm scripts for Vite`

7. **Phase 7: Verification**

   - Run tests, build, preview
   - Manual testing
   - No commit (verification only)

8. **Phase 8: Documentation**
   - Update README.md
   - Update CHANGELOG.md
   - Commit: `docs: update README for Vite migration`
   - Commit: `chore: update CHANGELOG for Vite migration`

## Non-Goals

- **Not migrating to Vitest** - Keep Jest to minimize risk
- **Not changing source code structure** - Only config changes
- **Not updating dependencies** - Only swapping build tools
- **Not adding new features** - Pure migration, no enhancements
- **Not changing deployment automation** - Keep manual deployment process

## Open Questions

None - design is approved and ready for implementation.
