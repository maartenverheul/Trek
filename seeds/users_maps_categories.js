/** @type {import('knex').Knex} */

exports.seed = async function (knex) {
  // Clear existing data (order matters due to FKs)
  await knex("markers").del();
  await knex("categories").del();
  await knex("maps").del();
  await knex("users").del();

  // Insert one demo user
  const [user] = await knex("users")
    .insert({ name: "Demo User", email: "demo@example.com" })
    .returning(["id", "name", "email"]);

  // Insert a couple of maps for the user
  const insertedMaps = await knex("maps")
    .insert([
      {
        title: "My First Map",
        description: "Getting started map",
        user_id: user.id,
      },
      {
        title: "City Walks",
        description: "Urban exploration routes",
        user_id: user.id,
      },
    ])
    .returning(["id", "title", "user_id"]);
  const maps = insertedMaps;
  const firstMapId = maps[0].id;

  // Insert some categories for the user
  await knex("categories").insert([
    {
      title: "Default",
      description: "General markers",
      color: "#888888",
      map_id: firstMapId,
    },
    {
      title: "Hiking",
      description: "Trails and hikes",
      color: "#2e8b57",
      map_id: firstMapId,
    },
    {
      title: "Food",
      description: "Restaurants and cafes",
      color: "#ff6347",
      map_id: firstMapId,
    },
  ]);

  // Seed some demo markers on the first map
  const samples = [
    {
      title: "Golden Gate Bridge",
      lat: 37.8199,
      lng: -122.4783,
      description: "San Francisco, CA",
    },
    {
      title: "Central Park",
      lat: 40.785091,
      lng: -73.968285,
      description: "New York, NY",
    },
    {
      title: "Eiffel Tower",
      lat: 48.8584,
      lng: 2.2945,
      description: "Paris, France",
    },
    {
      title: "Sydney Opera House",
      lat: -33.8568,
      lng: 151.2153,
      description: "Sydney, Australia",
    },
    {
      title: "Dam Square",
      lat: 52.3731,
      lng: 4.8936,
      description: "Amsterdam, NL",
    },
  ];

  for (const m of samples) {
    await knex("markers").insert({
      title: m.title,
      description: m.description,
      map_id: firstMapId,
      category_id: null,
      geom: knex.raw("ST_SetSRID(ST_MakePoint(?, ?), 4326)", [m.lng, m.lat]),
    });
  }
};
