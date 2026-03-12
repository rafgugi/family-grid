# Bundle Size Optimization Analysis

## Comparison: CRA vs Vite

### Single Bundle (Before Code Splitting)

| Metric           | CRA    | Vite   | Difference    |
| ---------------- | ------ | ------ | ------------- |
| **Uncompressed** | 1.6 MB | 1.7 MB | +100 KB (+6%) |
| **Gzipped**      | 430 KB | 460 KB | +30 KB (+7%)  |

**Verdict:** Vite is slightly larger but acceptable.

---

## Code Splitting Results (After Optimization)

### Chunk Breakdown (Gzipped)

| Chunk                | Size       | Description                                 |
| -------------------- | ---------- | ------------------------------------------- |
| **vendor-gojs**      | 253 KB     | GoJS diagram library (biggest chunk)        |
| **vendor-utils**     | 86 KB      | lodash, file-saver, yaml, image compression |
| **vendor-bootstrap** | 67 KB      | Bootstrap + Reactstrap UI                   |
| **vendor-react**     | 62 KB      | React core + i18n                           |
| **app (index)**      | 12 KB      | Your application code                       |
| **Total**            | **480 KB** | All JavaScript (gzipped)                    |

### Benefits of Code Splitting

✅ **Better Caching**

- Vendor chunks (React, GoJS, Bootstrap) rarely change
- Users only re-download your 12KB app code on updates
- Vendor chunks stay cached between deployments

✅ **Parallel Downloads**

- Browser downloads 5 chunks simultaneously
- Faster initial load than one large file

✅ **Easier Debugging**

- Clear separation between vendor and app code
- Smaller chunks easier to analyze

---

## Where Does the Size Come From?

### Top 3 Contributors

1. **GoJS (253 KB gzipped, ~930 KB raw)**

   - Commercial diagramming library
   - Powers the family tree visualization
   - **Options to reduce:**
     - Use tree-shaking if GoJS supports it
     - Consider alternatives: D3.js, Cytoscape.js, or custom Canvas API
     - Lazy load: Only load GoJS when user opens diagram view

2. **Lodash (part of vendor-utils: 86 KB total)**

   - Utility library
   - **Options to reduce:**
     - Use lodash-es (ESM version with better tree-shaking)
     - Replace with native ES6 methods where possible
     - Import specific functions: `import debounce from 'lodash/debounce'`

3. **Bootstrap + Reactstrap (67 KB)**
   - Full CSS framework
   - **Options to reduce:**
     - Use Bootstrap components selectively
     - Consider lighter alternatives: Tailwind CSS, shadcn/ui

---

## Optimization Recommendations

### Quick Wins (Low Effort)

1. **Lazy Load GoJS** (Saves ~250 KB on initial load)

   ```typescript
   // Only load when diagram is opened
   const GoJS = lazy(() => import('./components/FamilyDiagram'));
   ```

2. **Use lodash-es** (Better tree-shaking)

   ```bash
   npm install lodash-es
   npm uninstall lodash
   ```

3. **Enable Compression on Server**
   - GitHub Pages already serves gzipped files
   - Brotli compression could save an additional 15-20%

### Medium Effort

4. **Dynamic Imports for Routes/Modals**

   - Load modals only when opened
   - Split by feature (diagram, table, text editor)

5. **Optimize Images**
   - Use WebP format for bootstrap icons
   - Inline small icons as SVG

### High Effort (Future)

6. **Replace GoJS**

   - GoJS is 50% of bundle size
   - Consider open-source alternatives
   - Or implement custom Canvas-based diagrams

7. **Minimize Bootstrap Usage**
   - Extract only used components
   - Consider headless UI libraries

---

## Current Status

✅ **Code splitting implemented** (5 chunks vs 1 bundle)  
✅ **Bundle size is acceptable** (480 KB gzipped)  
⚠️ **GoJS is the bottleneck** (253 KB of 480 KB)

**Recommendation:** Ship as-is. Optimize further if users complain about load times.

---

## How to Monitor Bundle Size

```bash
# Check bundle sizes
npm run build

# Compare with previous build
ls -lh dist/assets/*.js
```

Expected output:

```
vendor-gojs:      ~930 KB (253 KB gzipped)
vendor-utils:     ~250 KB ( 86 KB gzipped)
vendor-bootstrap: ~320 KB ( 67 KB gzipped)
vendor-react:     ~196 KB ( 62 KB gzipped)
app (index):       ~39 KB ( 12 KB gzipped)
```

If any chunk grows significantly, investigate why.
