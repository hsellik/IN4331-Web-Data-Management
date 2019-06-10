'use strict';
const uuidv4 = require('uuid/v4');
const { Pool } = require("pg");


exports.handler = async (event, context) => {
  const uuid = uuidv4();
  const user_id = ((event.pathParameters || {})['user_id']) || event.user_id;

  const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
  });

  const insertQuery = {
    text: 'INSERT INTO Orders(order_id, user_id, total_price) VALUES($1, $2, $3) RETURNING *',
    values: [uuid, user_id, 0],
  };

  var data;
  let client;
  try {
    client = await pool.connect();
    data = await client.query(insertQuery);

    if (data.rows.length === 0) {
      throw "Duplicate ID tried to be written.";
    }
    client.release();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: uuid
      })
    };
  } catch (err) {
    if (client) client.release();
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Something wrong! Could not create order.",
        Data: JSON.stringify((data || {}).rows),
        Error: err
      })
    };
  }

};
