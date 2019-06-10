"use strict";

exports.handler = async (event, context) => {
  const { Pool } = require("pg");
  const order_id = ((event.pathParameters || {})['order_id']) || event.order_id;

  const deleteQuery = {
    text: "DELETE FROM Orders WHERE order_id = $1 RETURNING *",
    values: [order_id]
  };

  const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
  });

  let data;
  let client;
  try {
    client = await pool.connect();
    data = await client.query(deleteQuery);
    client.release();
    if (data.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ Message: "Order not found " + order_id })
      };
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: order_id
    };
  } catch (err) {
    if (client) client.release();
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Something wrong! Could not delete order " + order_id + " .",
        Data: JSON.stringify((data || {}).rows),
        Error: err
      })
    };
  }

};
