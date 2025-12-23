/** @type {import('knex').Knex} */

exports.up = async function (knex) {
  // Extensions
  await knex.raw("CREATE EXTENSION IF NOT EXISTS postgis");
  await knex.raw("CREATE EXTENSION IF NOT EXISTS pgcrypto");

  // Users
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.text("name").notNullable();
    table.text("email").notNullable().unique();
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
  });

  // Maps (belongs to one user)
  await knex.schema.createTable("maps", (table) => {
    table.increments("id").primary();
    table.text("title").notNullable();
    table.text("description");
    table
      .integer("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.index(["user_id"], "maps_user_id_idx");
  });

  // Categories (belongs to one user)
  await knex.schema.createTable("categories", (table) => {
    table.increments("id").primary();
    table.text("title").notNullable();
    table.text("description");
    table.text("color");
    table
      .integer("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.index(["user_id"], "categories_user_id_idx");
  });

  // Markers
  await knex.schema.createTable("markers", (table) => {
    table.increments("id").primary();
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
  // Drop children before parents to satisfy FKs
  await knex.schema.dropTableIfExists("markers");
  await knex.schema.dropTableIfExists("categories");
  await knex.schema.dropTableIfExists("maps");
  await knex.schema.dropTableIfExists("users");
};
