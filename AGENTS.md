# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository.

## Project Overview

This is an AWS Lambda serverless starter project written in **Node.js** and **TypeScript**, organized as an **npm workspaces monorepo**. The application code and the AWS CDK infrastructure code are separate workspaces. All code is **ESM**, and all unit tests use **Vitest**.

---

## Technology Stack

- **Language:** TypeScript 6
- **Module System:** ESM (`"type": "module"`, `module: nodenext`)
- **Platform:** AWS Lambda
- **Runtime:** Node.js 24+
- **AWS SDK:** v3 (modular packages)
- **Testing:** Vitest (with `@vitest/coverage-v8`)
- **Linting/Formatting:** ESLint + Prettier
- **Validation:** Zod
- **Logging:** Pino + Pino-Lambda (`@leanstacks/lambda-utils`)
- **Package Manager:** npm (workspaces)
- **Infrastructure:** AWS CDK v2 (run with `tsx`)
- **DevOps:** GitHub Actions

---

## Project Structure

```
/packages
  /api                          # Workspace: Lambda functions and application source
    /src
      /handlers                 # Lambda handlers (parse input, call services, return responses)
        get-task.ts
        get-task.test.ts        # Unit tests live next to the source file
      /services                 # Business logic
      /models                   # Data models, DTOs, and Zod schemas
      /utils                    # AWS clients, config, logging, constants
    package.json                # API dependencies and scripts
    tsconfig.json               # Extends /tsconfig.base.json; defines the `@/` alias
    vitest.config.ts            # Extends /vitest.config.ts with mergeConfig

  /infra                        # Workspace: AWS CDK infrastructure as code
    /stacks                     # One stack per major grouping of resources
    /utils
      config.ts                 # CDK config helper (validated with Zod)
    app.ts                      # CDK app entry point
    cdk.json                    # CDK config
    .env.example                # Documents required CDK environment variables
    package.json                # CDK dependencies and scripts
    tsconfig.json               # Extends /tsconfig.base.json; defines the `@/` alias
    vitest.config.ts            # Extends /vitest.config.ts with mergeConfig

/docs                           # Project documentation (see docs/README.md)
/.github                        # Workflows, issue and PR templates, Copilot pointer to this file

.editorconfig                   # Editor config
.nvmrc                          # Node version
.prettierrc                     # Prettier config
eslint.config.mjs               # ESLint config (covers all workspaces)
package.json                    # Root: workspaces, shared devDependencies and scripts
tsconfig.base.json              # Base TypeScript config extended by the workspaces
vitest.config.ts                # Base Vitest config extended by the workspaces
```

### Monorepo conventions

- Shared/common packages (TypeScript, ESLint, Prettier, Vitest, `@types/*`, etc.) are installed in the **root** `package.json`.
- Workspace-specific dependencies live in the workspace `package.json`.
- There is a single `package-lock.json` at the root. Run `npm install` / `npm ci` from the root only.
- Common scripts (`build`, `clean`, `test`, `test:coverage`) are defined at the root and run in each workspace with `--workspaces --if-present`.

---

## Commands & Scripts

Run from the repository root unless noted.

- `npm run build` - Type-check all workspaces (`tsc --noEmit`). Lambdas are bundled by CDK/esbuild at synth/deploy time.
- `npm run clean` - Remove build outputs and coverage.
- `npm run test` - Run all unit tests.
- `npm run test:coverage` - Run all unit tests with coverage.
- `npm run test:watch` - Run Vitest in watch mode.
- `npm run lint` / `npm run lint:fix` - Run ESLint.
- `npm run format` / `npm run format:check` - Run/check Prettier.
- `npm run <script> -w packages/api` - Run a script in a single workspace (use `packages/infra` for CDK).
- `npm run synth -w packages/infra` - Synthesize CDK stacks.
- `npm run cdk -w packages/infra -- <command>` - Run any CDK command (for example `diff`, `deploy`).
- `npm run local:start` / `local:stop` / `local:logs` - Manage LocalStack. See `docs/LocalStackGuide.md`.

Before finishing a change, make sure `npm run lint`, `npm run format:check`, `npm run build`, and `npm run test` pass.

---

## Source Code Guidelines

- Use **TypeScript** for all source and infrastructure code.
- Use **ESM**. Relative and alias imports **must include the `.js` extension** (for example `import { logger } from '@/utils/logger.js'`), even though the source file is `.ts`.
- Use `node:` prefixes for Node built-ins (for example `node:path`). There is no `__dirname` in ESM; use `import.meta.url`.
- The `@/` alias refers to the `src` directory of the API workspace (`packages/api/src`) and to the root of the infra workspace (`packages/infra`). It is configured in each workspace's `tsconfig.json` (`paths`) and `vitest.config.ts` (`resolve.alias`), and esbuild uses the API tsconfig when bundling the Lambdas.
- Use arrow functions for defining functions.
- Handlers parse input, call services, and return responses; they reside in `/handlers`.
- Core business logic resides in `/services`.
- Create types, interfaces, and DTOs in `/models`.
- Create reusable utilities in `/utils` (AWS clients, config helpers, logging).
- Validate configuration and input data with **Zod**.
- Organize import statements: external packages first, then internal modules.
- Use async/await for asynchronous operations.
- Handle errors gracefully and return meaningful error responses.
- Document functions and modules with JSDoc comments.
- Format with Prettier (120 columns, single quotes, semicolons, trailing commas). Do not hand-format.

---

## Unit Testing Guidelines

- Use **Vitest**. Import test APIs explicitly: `import { describe, it, expect, vi, beforeEach } from 'vitest'` (globals are disabled).
- Place test files next to the source file with a `.test.ts` suffix.
- Use `describe` and `it` blocks for organization; `beforeEach` for setup and `afterEach` for cleanup.
- Mock dependencies to isolate the component under test, and mock external calls (AWS SDK, databases).
- `vi.mock` calls are hoisted above imports. Variables used inside a `vi.mock` factory must be created with `vi.hoisted(() => ({ ... }))`.
- To test module-level initialization, call `vi.resetModules()` and then `await import('./module.js')` inside the test. Use `vi.doMock` for per-test, non-hoisted mocks.
- A mock used as a constructor (`new`) needs a `function` or `class` implementation, not an arrow function.
- Structure tests using Arrange-Act-Assert, and add comments to separate the sections.
- Shared Vitest settings live in the root `vitest.config.ts`. Workspaces extend it using `mergeConfig`.

---

## AWS CDK Guidelines

- The design philosophy prioritizes cost efficiency, scalability, and security.
- Use **AWS CDK v2** and **TypeScript** in `packages/infra`. The CDK app runs with `tsx` (see `cdk.json`).
- Define one CDK stack per major grouping of resources (for example lambda stack, data stack).
- Never commit secrets or hardcoded credentials.
- Use `packages/infra/.env` for local configuration (never commit it) and `.env.example` to document required variables. Prefix variables with `CDK_`.
- Use **AWS SSM Parameter Store** for secure configuration.
- Tag all CDK resources for cost allocation and management: `App`, `Env` (dev, qat, prd), `OU`, and `Owner`.
- Use **NodejsFunction** from `aws-cdk-lib/aws-lambda-nodejs` for the Lambdas. Handlers are bundled as ESM (`OutputFormat.ESM`, `index.mjs`) using the API workspace `tsconfig.json`.

### DynamoDB Tables

- Prefer single-table design where feasible.
- Use composite primary keys (partition key + sort key) for efficient querying.

---

## Documentation

- Keep `README.md` and `/docs` up to date when changing structure, scripts, or configuration.
- This `AGENTS.md` is the single source of truth for agent instructions. `.github/copilot-instructions.md` only points here.
