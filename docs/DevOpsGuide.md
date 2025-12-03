# DevOps Guide

## Overview

This guide documents the DevOps automation for the project, focusing on the use of GitHub Actions for CI/CD and operational workflows. It is intended for software engineers and DevOps engineers responsible for maintaining and deploying the project to AWS.

---

## GitHub Actions Workflows

The project uses GitHub Actions to automate the following tasks:

- **Continuous Integration (CI):**
  - Linting, building, and testing the application and infrastructure code on every push and pull request.
- **Continuous Deployment (CD):**
  - Automated deployment to AWS for specific branches or tags (e.g., `main`, `prd`).
- **Code Quality Gates:**
  - Enforces code formatting, linting, and test coverage thresholds before merging.
- **Release Automation:**
  - Optionally, creates releases and tags for production deployments.

---

## Workflow Summary

The project utilizes the following workflows.

| Workflow Name          | Purpose                       | Triggers                               |
| ---------------------- | ----------------------------- | -------------------------------------- |
| Continuous Integration | Lint, build, test             | pull_request, manual                   |
| Deploy to DEV          | Deploy to DEV environment     | manual                                 |
| Code Quality           | Generate code quality reports | push to main branch, scheduled, manual |

---

## Workflow Configuration

Workflows are defined in `.github/workflows/` as YAML files. Each workflow is triggered by specific events (push, pull_request, release, etc.).

### Example Workflow Structure

```yaml
name: CI
on:
  push:
    branches: [main, dev, qat, prd]
  pull_request:
    branches: [main, dev, qat, prd]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
```

---

## Environment Variables and Secrets

Workflows are configured using GitHub Actions variables and secrets:

- **Variables:**
  - Used for non-sensitive configuration (e.g., environment names, deployment flags).
  - Set in the repository or organization settings under "Variables".
- **Secrets:**
  - Used for sensitive data (e.g., AWS credentials, tokens).
  - Set in the repository or organization settings under "Secrets".

### Common Variables and Secrets

See the [Configuration Guide](./ConfigurationGuide.md) for a comprehensive list of variables and secrets.

---

## Adding or Modifying Workflows

- Add new workflow files to `.github/workflows/`.
- Reference official GitHub Actions and community actions for best practices.
- Use secrets for all sensitive data.
- Review workflow logs in the GitHub Actions tab for troubleshooting.

---

## Further Reading

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Project Infrastructure Guide](./InfrastructureGuide.md)
- [Project Configuration Guide](./ConfigurationGuide.md)
