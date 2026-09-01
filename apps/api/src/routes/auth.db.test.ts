/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from 'vitest';

import { auth } from '@wellness/auth';

describe('Better Auth Database Adapter', () => {
  it('Should successfully execute findAccountOwnerByKey without generating a syntax error', async () => {
    const adapter = auth.options.database;
    expect(adapter).toBeDefined();

    // Drizzle Adapter returns a function that we evaluate to get the actual adapter instance
    const adapterInstance = typeof adapter === 'function' ? adapter(auth.options) : adapter;

    if (!('findOne' in (adapterInstance as any))) {
      throw new Error('Adapter instance does not have findOne method');
    }

    const instance = adapterInstance as any;

    // Call findOne with the EXACT parameters that caused the previous 42601 syntax error
    // If 'issuer' is missing from the Drizzle schema, this will throw a syntax error: "where ( = $1"
    const account = await instance.findOne({
      model: 'account',
      where: [
        { field: 'issuer', value: 'https://accounts.google.com' },
        { field: 'accountId', value: `isolated-test-id-${Date.now().toString()}` },
      ],
    });

    // We don't care about the account itself, we just care that the query executed successfully
    // meaning the 'issuer' column exists and is properly mapped by Drizzle.
    // By using an isolated generated lookup value, we ensure success doesn't depend on shared DB state.
    expect(account).toBeNull();
  });
});
