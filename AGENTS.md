# Wellness Platform AI Instructions

## Architecture

- Backend is Express 5.
- Monorepo uses pnpm and Turborepo.
- Node.js 22 is required.
- TypeScript strict mode is mandatory.
- Never use `any`.
- Use Zod for untrusted input.
- Use Mongoose for MongoDB.
- Use Pino for application logging.
- Controllers remain thin.
- Business logic belongs in services.
- Shared API contracts belong in @wellness/contracts.
- Shared validation belongs in @wellness/validation.
- Environment configuration belongs in @wellness/config.
- MongoDB infrastructure belongs in @wellness/db.
- Authentication belongs in @wellness/auth.
- Generic framework-independent utilities belong in @wellness/utils.

## Dependency Rules

- Prefer Node.js built-ins when they are sufficient.
- Do not install a dependency for functionality already provided by Node.js.
- Do not introduce duplicate libraries.
- Do not create abstractions without a concrete requirement.
- Do not introduce repositories/DAOs without a clear reason.
- Do not introduce microservices.
- Do not introduce Redis without a demonstrated requirement.
- Do not introduce Kafka without a demonstrated requirement.

## Security

- Never commit secrets.
- Never expose secrets to clients.
- Never log passwords.
- Never log authentication tokens.
- Never log cookies.
- Never log Razorpay secrets.
- Validate all untrusted external input.
- Never trust payment status from the client.
- Verify Razorpay webhook signatures.
- Keep payment secrets server-side.

## Performance

- Avoid unnecessary database queries.
- Avoid N+1 queries.
- Use lean queries for appropriate read-only MongoDB operations.
- Use projections when full documents are unnecessary.
- Keep API payloads small.
- Avoid blocking the Node.js event loop.
- Reuse database connections.
- Do not introduce caching without identifying a real bottleneck.
- Measure before optimizing.

## Code Quality

- Prefer small focused functions.
- Prefer explicit types.
- Prefer async/await.
- Handle errors explicitly.
- Avoid deeply nested logic.
- Avoid speculative abstractions.
- Keep modules focused.
- Use node:* imports for Node built-ins.
- Keep imports organized.
- Do not duplicate existing utilities.

## AI Workflow

Before changing code:

1. Inspect the existing implementation.
2. Understand package boundaries.
3. Reuse existing utilities.
4. Avoid creating duplicate abstractions.
5. Make the smallest change that correctly solves the task.

After changing code:

1. Run formatting.
2. Run ESLint.
3. Run TypeScript checks.
4. Run relevant tests.
5. Run the build when architecture/dependencies changed.

Never claim a check passed unless it was actually executed.
