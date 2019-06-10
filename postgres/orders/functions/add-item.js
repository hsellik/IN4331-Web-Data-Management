"use strict";
const { Pool } = require("pg");

exports.handler = async (event, context) => {
  const order_id = ((event.pathParameters || {})["order_id"]) || event.order_id;
  const item_id = ((event.pathParameters || {})["item_id"]) || event.item_id;

  const insertQuery = {
    text: "INSERT INTO OrderRow(order_id, item_id, quantity) VALUES($1, $2, $3) RETURNING *",
    values: [order_id, item_id, 1]
  };

  const updateQuery = {
    text: "UPDATE OrderRow SET quantity = quantity + 1 WHERE order_id = $1 AND item_id = $2 RETURNING *",
    values: [order_id, item_id]
  };

  const updateOrderQuery = {
    text: "UPDATE Orders SET total_price = total_price + 1 WHERE order_id = $1 RETURNING *",
    values: [order_id]
  };

  const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
  });

  var data;
  let client;
  try {
    client = await pool.connect();
    data = await client.query(updateQuery);
    if (data.rows.length === 0) {
      data = await client.query(insertQuery);
    }
    await client.query(updateOrderQuery);
    client.release();

    return {
      statusCode: 200,
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({Item: data.rows[0]})
    };


  } catch (e) {
    if (client) client.release();
    return {
      statusCode: 500,
      body: JSON.stringify({ Message: e })
    };
  }

};
