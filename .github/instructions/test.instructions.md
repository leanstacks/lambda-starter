---
applyTo: '**/*.test.ts,**/*.spec.ts'
---

# Unit Testing Guidelines

- Use the **Jest** testing framework.
- Place test files next to the source file, with `.test.ts` suffix.
- Use `describe` and `it` blocks for organization.
- Use `beforeEach` for setup and `afterEach` for cleanup.
- Use `expect` assertions for results.
- Mock dependencies to isolate the component under test.
- Mock external calls (e.g., AWS SDK, databases).
- Structure your tests using the Arrange-Act-Assert pattern:
  - **Arrange:** Set up the test environment, including any necessary mocks and test data.
  - **Act:** Execute the function or service being tested.
  - **Assert:** Verify that the results are as expected.
  - Add comments to separate these sections for clarity.

# Commands & Scripts

- Use `npm run test` to run tests.
- Use `npm run test:coverage` to run tests with coverage report.
- Use `npm run lint` to run ESLint.
- Use `npm run lint:fix` to fix ESLint issues.
- Use `npm run format` to run Prettier to format code.
- Use `npm run format:check` to check code formatting with Prettier.
