/** @type {import('knex').Knex} */

exports.seed = async function (knex) {
  const samples = [
    {
      title: "Golden Gate Bridge",
      lat: 37.8199,
      lng: -122.4783,
      description: "San Francisco, CA",
      color: "#ff3b3b",
    },
    {
      title: "Central Park",
      lat: 40.785091,
      lng: -73.968285,
      description: "New York, NY",
      color: "#1e90ff",
    },
    {
      title: "Eiffel Tower",
      lat: 48.8584,
      lng: 2.2945,
      description: "Paris, France",
      color: "#32cd32",
    },
    {
      title: "Sydney Opera House",
      lat: -33.8568,
      lng: 151.2153,
      description: "Sydney, Australia",
      color: "#ffd700",
    },
    {
      title: "Dam Square",
      lat: 52.3731,
      lng: 4.8936,
      description: "Amsterdam, NL",
      color: "#8a2be2",
    },
  ];

  for (const m of samples) {
    await knex("markers").insert({
      title: m.title,
      description: m.description,
      color: m.color,
      geom: knex.raw("ST_SetSRID(ST_MakePoint(?, ?), 4326)", [m.lng, m.lat]),
    });
  }
};
