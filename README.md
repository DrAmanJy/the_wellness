# Wellness Platform Backend

This repository contains the backend API and shared packages for the Wellness Platform.
Built with Node 22, Express 5, and pnpm + Turborepo.

## Project Structure

```text
apps/
  api/ - Main Express 5 application
packages/
  auth/ - Better Auth foundation
  config/ - Environment configuration
  contracts/ - Shared types and API responses
  db/ - Database connections (MongoDB)
  utils/ - Shared utilities
  validation/ - Zod schemas
```

## Setup & Installation

1. Switch to the correct Node version: `nvm use`
2. Install dependencies: `pnpm install`
3. Copy `.env.example` to `.env` in `apps/api` and configure your secrets.

The `pnpm install` command automatically initializes Git hooks (Husky).

## Commands

### Development

- `pnpm dev` - Start the development server (uses Turborepo)

### Formatting

- `pnpm format` - Auto-format all files with Prettier
- `pnpm format:check` - Check formatting without modifying files

### Linting

- `pnpm lint` - Run ESLint across all packages
- `pnpm lint:fix` - Auto-fix ESLint issues where possible

### Type Checking

- `pnpm typecheck` - Run TypeScript validation across all packages

### Testing

- `pnpm test` - Run the Vitest test suite

### Building

- `pnpm build` - Build all packages for production

### Complete Local Check

- `pnpm check` - Run formatting check, linting, typechecking, and testing in sequence. Use this before opening a PR.

## Git Hooks

Husky and `lint-staged` are configured to automatically run Prettier and ESLint on staged files before every commit. This ensures code quality without slowing down commits by running full builds.

## AI Development Rules

Please refer to `AGENTS.md` for strict architectural, security, performance, and code quality guidelines that all AI agents must follow when modifying this codebase.

## AI Code Review

This repository uses:

- Qodo
- CodeRabbit
- AGENTS.md

`AGENTS.md` is the shared source of AI development standards.
ESLint/Prettier/TypeScript provide deterministic validation.
Qodo and CodeRabbit provide independent PR review.

## CI

GitHub Actions (`.github/workflows/ci.yml`) is configured to run on every push and pull request to the `main` branch. It executes:

- Dependency installation (cached)
- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
