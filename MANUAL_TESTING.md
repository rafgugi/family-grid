# Manual Testing Guide: Sibling Sorting Fix

## Testing the Fix

### Setup

1. Start the development server: `npm start`
2. Open http://localhost:3000 in your browser

### Test Case 1: Mixed Married/Unmarried Siblings

**Test Data**: Use `src/test-data-sibling-order.yml`

**Steps**:

1. Copy `test-data-sibling-order.yml` to `data.yml`
2. Reload the page
3. Observe the family tree diagram

**Expected Result**:
Siblings should appear LEFT-TO-RIGHT in this order:

1. Charlie (married) - FIRST
2. Eve (unmarried) - SECOND
3. Frank (married) - THIRD

**Bug Behavior** (if fix didn't work):
Siblings would appear as: Eve, Charlie, Frank (unmarried first)

Actual: Eve Charlie Frank

### Test Case 2: Original Data

**Steps**:

1. Use the original `data.yml` (or restore backup)
2. Reload the page
3. Verify the family tree displays correctly

**Expected Result**:

- All family members visible
- Parent-child relationships correct
- Multi-generation layout correct
- No visual glitches or misalignments

seems like good so far, other than ordering

### Test Case 3: Edge Cases

Create test data for:

1. **Single unmarried child** - should display correctly
2. **All siblings married** - should maintain data order PASSED
3. **All siblings unmarried** - should maintain data order PASSED
4. **Multiple generations** - each generation's siblings maintain their order independently

## Verification Checklist

- [ ] Mixed sibling test shows correct order (Charlie, Eve, Frank)
- [x] Original data displays without errors
- [x] Parent-child relationships preserved
- [ ] Generation alignment correct
- [x] No console errors
- [x] Diagram renders smoothly

## Notes

The fix ensures that the `net.linkVertexes()` calls in GenogramLayout happen in the same order as links appear in the data model, regardless of whether children are married or unmarried.
