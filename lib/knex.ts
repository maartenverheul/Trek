import dotenv from 'dotenv';
import knexPkg, { Knex } from 'knex';

dotenv.config({ path: '.env.local' });

const config: Knex.Config = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: { min: 0, max: 10 },
};

declare global {
  // eslint-disable-next-line no-var
  var _trekKnex: Knex | undefined;
}

export const knex: Knex = global._trekKnex ?? knexPkg(config);
if (!global._trekKnex) {
  global._trekKnex = knex;
}
