import { describe, expect, it } from 'vitest';

import { account } from '@wellness/db';

describe('Better Auth Database Schema', () => {
  it('exposes the issuer column for findAccountOwnerByKey', () => {
    // Better Auth's Drizzle adapter queries the "issuer" field to support OAuth providers.
    // If it's missing from the Drizzle schema, runtime syntax errors occur during sign-in.
    // Asserting the schema symbol ensures coverage of the mapping used by findAccountOwnerByKey.
    expect(account).toHaveProperty('issuer');
    expect(account.issuer).toBeDefined();
  });
});
