"use strict";
const { Pool } = require("pg");

exports.handler = async (event, context) => {
  const { order_id } = event.pathParameters;
  const { item_id } = event.pathParameters;

  const insertQuery = {
    text: "INSERT INTO OrderRow VALUES($1, $2, $3)",
    values: [order_id, item_id, 1]
  };

  const updateQuery = {
    text: "UPDATE OrderRow SET quantity = $1 WHERE order_id = $2 AND item_id = $3",
    values: [quantity, order_id, item_id]
  };

  const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
  });

  try {
    let data = await pool.query(updateQuery);
    if (data.rows.length === 0) {
      data = await pool.query(insertQuery);

      return {
        statusCode: 200,
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(data.rows)
      };
    }

  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ Message: e })
    };
  }

};
