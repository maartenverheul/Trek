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
    // Each category belongs to one map
    table
      .integer("map_id")
      .notNullable()
      .references("id")
      .inTable("maps")
      .onDelete("CASCADE");
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.index(["map_id"], "categories_map_id_idx");
  });

  // Markers
  await knex.schema.createTable("markers", (table) => {
    table.increments("id").primary();
    table.text("title").notNullable();
    table.text("description");
    // Address fields
    table.text("country");
    table.text("state");
    table.text("postal");
    table.text("city");
    table.text("street");
    table.text("house_number");
    // Notes (default empty string)
    table.text("notes").notNullable().defaultTo("");
    // Rating (1-10, optional; constraint added after table creation)
    table.integer("rating");
    // Visitations as JSONB array of objects: [{ y, m, d }, ...]
    table.jsonb("visitations").notNullable().defaultTo(knex.raw("'[]'::jsonb"));
    table.specificType("geom", "geometry(Point, 4326)").notNullable();
    // Each marker belongs to one map, and optionally a category
    table
      .integer("map_id")
      .notNullable()
      .references("id")
      .inTable("maps")
      .onDelete("CASCADE");
    table
      .integer("category_id")
      .nullable()
      .references("id")
      .inTable("categories")
      .onDelete("SET NULL");
    table
      .timestamp("created_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp("updated_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.index(["map_id"], "markers_map_id_idx");
    table.index(["category_id"], "markers_category_id_idx");
  });

  // Add check constraint for rating range (1-10)
  await knex.raw(
    'ALTER TABLE "markers" ADD CONSTRAINT "markers_rating_range" CHECK (rating IS NULL OR rating BETWEEN 1 AND 10)'
  );
};

exports.down = async function (knex) {
  // Drop children before parents to satisfy FKs
  await knex.schema.dropTableIfExists("markers");
  await knex.schema.dropTableIfExists("categories");
  await knex.schema.dropTableIfExists("maps");
  await knex.schema.dropTableIfExists("users");
};
