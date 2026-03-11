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
