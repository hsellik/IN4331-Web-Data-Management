console.log("Subtract items from stock for order");

const { Pool } = require("pg");

/**
 * input: {
 *     "order_id"   :   (from path), for console log
 *     "Item"       :   (from output json), Item.items is an array of items
 * }
 */
exports.handler = async function (e, ctx) {
  const item_id = ((e.path || {})["item_id"]) || (e["item_id"]) || ((e.pathParameters || {})["item_id"]);

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

  let client;

  async function subtract(client) {
    const updateQuery = {
      text: "UPDATE Stock SET quantity = quantity - $1 WHERE item_id = $2 RETURNING *",
      values: [number, item_id]
    };
    return await client.query(updateQuery);
  }

  try {
    client = await pool.connect();
    const data = await subtract(client);
    client.release();
    if (data.rows.length === 0) {
      return {
        statusCode: 403,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Message: "Something wrong! Not enough item: " + item_id + " in the stock.",
          Data: JSON.stringify(data)
        })
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Successfully substracted " + number + " " + item_id + " from the stock",
        Data: JSON.stringify(data)
      })
    };
  } catch (err) {
    if (client) client.release();
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Something wrong! Unable to substract item " + item_id + " from the stock.",
        Data: JSON.stringify(data),
        Error: err
      })
    };
  }
};
