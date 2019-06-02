'use strict';
const { Pool } = require("pg");

exports.handler = async (event, context) => {
  const { order_id } = event.pathParameters;
  const { item_id } = event.pathParameters;

  const updateQuery = {
    text: 'UPDATE OrderRow SET quantity=quantity-1 WHERE order_id = $1 AND item_id = $2',
    values: [order_id, item_id],
  };

  const deleteQuery = {
    text: 'DELETE FROM OrderRow WHERE EXISTS order_id = $1 AND item_id = $2 AND quantity = 1',
    values: [order_id, item_id],
  };

  const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
  });

  try {
    let data = await pool.query(deleteQuery);
    if (data.rows.length === 0) {
      data = await pool.query(updateQuery);
      if (data.rows.length === 0) {
        return {
          statusCode: 404,
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({ Message: "Item not found" })
        };
      }
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Message: "Successfully removed item " + item_id,
          Data: JSON.stringify(data.rows)
        })
      };
    }
  } catch (err) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Something wrong! Could not delete item " + item_id + " .",
        Data: JSON.stringify(data.rows),
        Error: err
      })
    };
  }

};
