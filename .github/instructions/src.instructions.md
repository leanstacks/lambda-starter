---
applyTo: 'src/**/*.ts,!src/**/*.test.ts,!src/**/*.spec.ts'
---

# Source Code Guidelines

- Use **TypeScript** for all source and infrastructure code.
- Use arrow functions for defining functions.
- Use path aliases for cleaner imports (e.g., `@utils`, `@models`).
- Handlers parse input, call services, and return responses reside in `/handlers`.
- Core business logic should reside in `/services`.
- Create types and interfaces in `/models` for data structures and DTOs.
- Create reusable utilities in `/utils` (e.g., AWS clients, response helpers, config helpers, logging).
- Validate configuration and input data with **Zod**.
- Organize import statements: external packages first, then internal modules.
- Use async/await for asynchronous operations.
- Handle errors gracefully and return meaningful error responses.
- Document functions and modules with JSDoc comments.

# Commands & Scripts

- Use `npm run build` to compile TypeScript.
- Use `npm run test` to run tests.
- Use `npm run test:coverage` to run tests with coverage report.
- Use `npm run lint` to run ESLint.
- Use `npm run lint:fix` to fix ESLint issues.
- Use `npm run format` to run Prettier to format code.
- Use `npm run format:check` to check code formatting with Prettier.
