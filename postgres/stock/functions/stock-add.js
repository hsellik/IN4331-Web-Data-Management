console.log("Add item to stock");

const { Pool } = require("pg");

/**
 * input: {
 *     "item_id"    :   (from path),
 *     "number"     :   (from path)
 * }
 */
exports.handler = async function (e, ctx) {
  const item_id = ((e.path || {})["item_id"]) || (e["item_id"]);
  const numberRaw = ((e.path || {})["number"]) || (e["number"]) || ((e.pathParameters || {})["number"]);

  const number = parseInt(numberRaw, 10);

  if (Number.isNaN(number)) {
    return {
      statusCode: 400,
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ message: `Amount parameter is not a number: \"${numberRaw}\"` })
    };
  }

  const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
  });

  const updateQuery = {
    text: "UPDATE Stock SET quantity = quantity + $1 WHERE item_id = $2 RETURNING *",
    values: [number, item_id]
  };

  try {
    const data = await pool.query(updateQuery);

    if (data.rows.length === 0) {
      return {
        statusCode: 403,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Message: "Something wrong! Unable to add item " + item_id + " to the stock. Perhaps you need to create one."
        })
      };
    } else {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Message: "Successfully added " + number + " " + item_id + " to the stock",
          Data: JSON.stringify({Item: data.rows[0]})
        })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ Message: err })
    };
  }
};
