/** @type {import('knex').Knex} */

exports.up = async function (knex) {
  // Extensions
  await knex.raw("CREATE EXTENSION IF NOT EXISTS postgis");
  await knex.raw("CREATE EXTENSION IF NOT EXISTS pgcrypto");

  // Table
  await knex.schema.createTable("markers", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.text("title").notNullable();
    table.text("description");
    table.text("color");
    table.specificType("geom", "geometry(Point, 4326)").notNullable();
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("markers");
};
