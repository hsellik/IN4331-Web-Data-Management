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

  async function subtract() {
    const updateQuery = {
      text: "UPDATE Stock SET quantity = quantity - $1 WHERE item_id = $2 RETURNING *",
      values: [number, item_id]
    };
    // return await dynamoDB.update(params).promise();
    return await pool.query(updateQuery);
  }

  // async function checkQuantity(items) {
  //   const selectQuery = `SELECT item_id, quantity FROM Stock WHERE item_id IN ${items.join()}`;
  //
  //   const data = await pool.query(selectQuery);
  //
  //   if (items.length !== data.rows.length) {
  //     throw new Error("ERROR! Some items do not exist of order: " + order_id);
  //   }
  //
  //   let satisfied = 0;
  //   for (let item of data.rows) {
  //     for (let orderItem of items) {
  //       if (item["item_id"] === orderItem["item_id"] && item["quantity"] > orderItem["quantity"]) {
  //
  //         satisfied++;
  //       }
  //     }
  //   }
  //   return satisfied === items.length;
  // }

  try {


    // const promises = Item.items.map(subtract);
    // const data = await Promise.all(promises);
    const data = await subtract();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Successfully substracted " + number + " " + item_id + " from the stock",
        Data: JSON.stringify(data)
      })
    };
  } catch (err) {
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
