# Investigation Log: Sibling Sorting Bug

## Goal

Verify that the GenogramLayout displays siblings in an incorrect order, prioritizing unmarried individuals before married ones, rather than preserving data array order.

## Test Data Created

Created `src/test-data-sibling-order.yml` with:

- Parents: parent1 (M) & parent2 (F)
- Children in specific order:
  1. Charlie (married to Diana) - FIRST in data
  2. Eve (unmarried) - SECOND in data
  3. Frank (married to Grace) - THIRD in data

## Expected Behavior

Diagram should show siblings left-to-right as: Charlie, Eve, Frank

## Bug Hypothesis

If the bug exists, diagram will show: Eve, Charlie, Frank (unmarried first)

## Investigation Steps

1. ✅ Created test data file with mixed sibling order
2. ✅ Analyzed GenogramLayout.ts code for sorting logic
3. ✅ Identified root cause in the `add()` method
4. ✅ Documented findings below

## ROOT CAUSE IDENTIFIED

**Location**: `src/GenogramLayout.ts`, lines 86-116 in the `add()` method

**The Problem**:
When processing parent-child links, the code handles unmarried and married children in separate code paths:

```typescript
// Line 96-98: Unmarried children processed first
if (child !== null) {
  // an unmarried child
  net.linkVertexes(parent, child, link);
} else {
  // Line 100-113: Married children processed second
  // a married child
  link.toNode?.linksConnected.each(l => {
    // ... find marriage label and link it
  });
}
```

**Why This Causes the Bug**:

1. When iterating through links, all unmarried children are added to the layout network first
2. Then all married children (via their marriage label nodes) are added second
3. GoJS's LayeredDigraphLayout then positions nodes based on the order they were added to the network
4. Result: Unmarried siblings appear before married siblings, regardless of data order

**Solution Approach**:
The edges need to be added in the same order as the children appear in the original data, not grouped by marital status. We need to preserve the iteration order from the data model.

## FIX IMPLEMENTED

### Attempt 1: Refactor link processing order (INCOMPLETE)

**Changes Made**: Refactored `GenogramLayout.ts` lines 85-116

- Removed nested `linksConnected.each()` callback that could reorder links
- Process married children inline, finding their marriage label vertex directly
- Both married and unmarried children now processed in sequential order as links are iterated

**Result**: ❌ Links added in correct order, BUT GoJS LayeredDigraphLayout still reordered siblings internally

### Attempt 2: Set column indices (FAILED - wrong property)

**Changes Made**: Added `childOrderMap` and set `v.column` in `initializeIndices()`

**Result**: ❌ Still rendered incorrectly. Diagnostic logging revealed GoJS uses `v.index` for positioning, not `v.column`!

### Attempt 3: Set BOTH column AND index (SUCCESS ✅)

**Root Cause Discovered via Systematic Debugging**:

Using diagnostic logging, discovered that:

```
Eve: column=1, index=0  <- rendered first despite column=1
Charlie: column=0, index=1  <- rendered second despite column=0
Frank: column=2, index=2
```

**GoJS uses `v.index` for final positioning, NOT `v.column`!**

**The Real Fix**:

1. Added `childOrderMap: Map<any, number>` property to GenogramLayout class
2. Track the order of child vertices as links are processed (store in map)
3. In `initializeIndices()` method, explicitly set **BOTH** `v.column` AND `v.index` to our preserved order
4. Setting `v.index` directly controls final sibling positioning

**Code Changes**:

- Constructor: Initialize `childOrderMap`
- `add()` method (lines 91-138): Track child vertex order in map as links are processed
- `initializeIndices()` method (lines 213-223): Apply order to BOTH column AND index properties

**Verification**:

- ✅ Code compiles successfully
- ✅ App loads without errors
- ✅ **Manual testing PASSED**: Siblings now render as Charlie, Eve, Frank (correct data order)

## Testing Approach

**Attempted**: Unit tests with jest-canvas-mock

- Installed jest-canvas-mock package
- Added to setupTests.ts
- Result: GoJS still has issues with canvas context in Jest environment

**Conclusion**: Full GoJS diagram testing in Jest is not feasible without significant mocking infrastructure.

**Recommendation**: Future tests should use:

- Integration tests with real browser (Playwright/Cypress)
- Or unit tests that mock GoJS entirely and test just our custom logic

**Current Status**: Fix verified through code review and manual testing. GenogramLayout.test.ts remains in codebase as documentation but tests are skipped.
