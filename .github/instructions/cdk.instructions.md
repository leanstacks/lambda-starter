---
applyTo: 'infrastructure/**'
---

# AWS CDK Guidelines

---

## General Principles

- Design philosophy prioritizes cost efficiency, scalability, and security.
- Self-contained AWS CDK project for infrastructure as code.
- Use **TypeScript** for all infrastructure code.
- Use **AWS CDK v2**.
- Define one CDK stack per major grouping of resources (e.g., lambda stack, data stack).
- Never commit secrets or hardcoded credentials.
- Use **.env** for local development configuration, but do not commit to source control.
- Use **.env.example** to document required environment variables.
- Prefix environment variables with `CDK_` to avoid conflicts.
- Use **AWS SSM Parameter Store** for secure configuration.
- All CDK resources must be tagged for cost allocation and management:
  - `App`: Application name
  - `Env`: Environment (e.g., dev, qat, prd)
  - `OU`: Organizational Unit, e.g. `leanstacks` or `shared-services`
  - `Owner`: Team or individual responsible
- Tag all CDK resources appropriately (`App`, `Env`, `OU`, `Owner`).

---

## DynamoDB Tables

- Prefer using single-table design where feasible.
- Use composite primary keys (partition key + sort key) for efficient querying.

---

## Lambda Functions

- Use **NodejsFunction** from `aws-cdk/aws-lambda-nodejs` to build Lambdas with automatic TypeScript transpilation.

---

## Commands & Scripts

- Use `npm run build` to compile TypeScript.
- Use `npm run test` to run tests.
- Use `npm run synth` to synthesize CDK stacks.
- Use `npm run cdk <command>` to run CDK commands (e.g., deploy, diff).
