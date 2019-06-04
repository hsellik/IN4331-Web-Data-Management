console.log("Check stock availability");

const { Pool } = require("pg");

/**
 * input: {
 *     "item_id"    :   (from path)
 * }
 */
exports.handler = async function (e, ctx) {
  const item_id = ((e.path || {})["item_id"]) || (e["item_id"]);

  const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
  });

  const selectQuery = {
    text: "SELECT * FROM Stock WHERE item_id = $1 AND quantity > 0",
    values: [item_id]
  };

  try {
    const data = await pool.query(selectQuery);

    if (data.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ Message: "User not found" })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Successfully retrieved availability of item " + item_id,
        Data: JSON.stringify(data.rows)
      })
    };
  } catch (err) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Something wrong! No " + item_id + " in the stock.",
        Data: JSON.stringify(data.rows),
        Error: err
      })
    };
  }
};
