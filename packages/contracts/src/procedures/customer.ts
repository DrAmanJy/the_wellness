import { createProcedure } from './core';

export const getAddressesProcedure = createProcedure<undefined, unknown[]>({
  name: 'getAddresses',
  method: 'GET',
  path: '/addresses',
  authRequired: true,
  description: 'Retrieve user addresses',
});

export const addAddressProcedure = createProcedure<Record<string, unknown>>({
  name: 'addAddress',
  method: 'POST',
  path: '/addresses',
  authRequired: true,
  description: 'Add new address for user',
});
