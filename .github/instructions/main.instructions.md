---
applyTo: '**'
---

# Main Project Guidelines

## Project Overview

This is an AWS Lambda serverless starter project written in **Node.js** and **TypeScript**. The project uses the **AWS CDK** for infrastructure as code. The project uses **Jest** for unit tests of the infrastructure and application code.

---

## Technology Stack

This project uses the following technologies:

- **Language:** TypeScript
- **Platform:** AWS Lambda
- **Runtime:** Node.js 24+
- **AWS SDK:** v3 (modular packages)
- **Testing:** Jest
- **Linting/Formatting:** ESLint + Prettier
- **Validation:** Zod
- **Package Manager:** npm
- **Infrastructure:** AWS CDK
- **DevOps:** GitHub Actions

---

## Project Structure

```
/docs                           # Project documentation
  README.md                     # Documentation table of contents

/src
  /handlers
    get-task.ts                 # Lambda handler
    get-task.test.ts            # Unit tests for get-task
  /services
    task-service.ts             # Business logic
    task-service.test.ts        # Unit tests for task-service
  /models
    task.ts                     # Task data model
  /utils
    aws-clients.ts              # AWS SDK clients
    config.ts                   # App configuration helper
    response.ts                 # Helper for formatting Lambda responses
    response.test.ts

/infrastructure
  /stacks
    lambda-stack.ts             # CDK stack for Lambdas
  /utils
    config.ts                   # CDK config helper
  app.ts                        # CDK app entry point
  cdk.json                      # CDK config
  jest.config.ts                # CDK Jest config
  jest.setup.ts                 # CDK Jest setup
  package.json                  # CDK NPM package config
  README.md                     # CDK README
  tsconfig.json                 # CDK TypeScript config

.editorconfig                   # Editor config
.gitignore                      # Git ignore rules
.nvmrc                          # Node version manager config
.prettierrc                     # Prettier config
eslint.config.mjs               # ESLint config
jest.config.ts                  # App Jest config
jest.setup.ts                   # App Jest setup
package.json                    # App NPM package config
README.md                       # Project README
tsconfig.json                   # Project TypeScript config
```

---

## Environments

- Environments are: `dev`, `qat`, and `prd`.
- Each environment has its own AWS account.
