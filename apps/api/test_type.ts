import { db } from '@wellness/db';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

function check(txOrDb: Tx | typeof db) {}
