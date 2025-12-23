/** @type {import('knex').Knex} */

exports.seed = async function (knex) {
  // Clear existing data (order matters due to FKs)
  await knex("categories").del();
  await knex("maps").del();
  await knex("users").del();

  // Insert one demo user
  const [user] = await knex("users")
    .insert({ name: "Demo User", email: "demo@example.com" })
    .returning(["id", "name", "email"]);

  // Insert a couple of maps for the user
  await knex("maps").insert([
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
  ]);

  // Insert some categories for the user
  await knex("categories").insert([
    {
      title: "Default",
      description: "General markers",
      color: "#888888",
      user_id: user.id,
    },
    {
      title: "Hiking",
      description: "Trails and hikes",
      color: "#2e8b57",
      user_id: user.id,
    },
    {
      title: "Food",
      description: "Restaurants and cafes",
      color: "#ff6347",
      user_id: user.id,
    },
  ]);
};
