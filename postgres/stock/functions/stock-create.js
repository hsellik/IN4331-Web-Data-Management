console.log("Create new item in stock");

const uuidv1 = require("uuid/v1");
const { Pool } = require("pg");

/**
 * input: no input
 */
exports.handler = async function (e, ctx) {
  const item_id = uuidv1();

  const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
  });

  const query = {
    text: "INSERT INTO Stock(item_id) VALUES($1) RETURNING *",
    values: [item_id]
  };

  try {
    const data = await pool.query(query);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Successfully created item " + item_id,
        Data: JSON.stringify(data.rows)
      })
    };
  } catch (err) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Unable to create item.",
        Data: JSON.stringify(data.rows),
        Error: err
      })
    };
  }
};
