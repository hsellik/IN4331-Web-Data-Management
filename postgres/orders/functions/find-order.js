'use strict';

const { Pool } = require("pg");

exports.handler = async (event, context) => {
  const order_id = ((event.pathParameters || {})['order_id']) || event.order_id;

  const selectQuery = {
    text: 'SELECT * FROM Orders LEFT JOIN OrderRow ON Orders.order_id = OrderRow.order_id WHERE Orders.order_id = $1',
    values: [order_id],
  };

  const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
  });

  const extractItemsArray = data => {
    const result = [];
    for (let row of data.rows) {
      result.push({
        item_id: row.item_id,
        quantity: row.quantity
      });
    }
    return result;
  };

  var data;
  let client;
  try {
    client = await pool.connect();
    data = await client.query(selectQuery);
    client.release();
    if (data.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ Message: "Order not found" })
      };
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Item: {
          total_price: data.rows[0].total_price,
          user_id: data.rows[0].user_id,
          order_id: order_id,
          items: extractItemsArray(data)
        }
      })
    };
  } catch (err) {
    if (client) client.release();
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Something wrong! Order ID: " + order_id + ".",
        Data: JSON.stringify((data || {}).rows),
        Error: err
      })
    };
  }

};
