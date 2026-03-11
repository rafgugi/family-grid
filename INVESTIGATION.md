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
2. ⏳ Temporarily swap data.yml to test-data-sibling-order.yml
3. ⏳ Run the app and observe sibling ordering
4. ⏳ Document findings and revert data file
5. ⏳ Identify root cause location (GenogramLayout vs GoJS vs data preparation)
