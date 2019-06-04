console.log("Subtract items from stock for order");

const { Pool } = require("pg");

/**
 * input: {
 *     "order_id"   :   (from path), for console log
 *     "Item"       :   (from output json), Item.items is an array of items
 * }
 */
exports.handler = async function (e, ctx) {
  const order_id = ((e.path || {})["order_id"]) || (e["order_id"]);
  const Item = e["Item"];

  const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
  });

  async function subtract(item) {
    const updateQuery = {
      text: "UPDATE Stock SET quantity = quantity - $1 WHERE item_id = $2 RETURNING *",
      values: [item.quantity, item.Item_ID]
    };
    // return await dynamoDB.update(params).promise();
    return await pool.query(updateQuery);
  }

  async function checkQuantity(items) {
    const selectQuery = `SELECT item_id, quantity FROM Stock WHERE item_id IN ${items.join()}`;

    const data = await pool.query(selectQuery);

    if (items.length !== data.rows.length) {
      throw new Error("ERROR! Some items do not exist of order: " + order_id);
    }

    let satisfied = 0;
    for (let item of data.rows) {
      for (let orderItem of items) {
        if (item["item_id"] === orderItem["Item_ID"] && item["quantity"] > orderItem["quantity"]) {
            console.log(`item id: ${item.item_id}`)
            console.log(`order quantity: ${orderItem.quantity}`)
            console.log(`item quantity: ${item.quantity}`)
          satisfied++;
        }
      }
    }
    return satisfied === items.length;
  }

  try {
    if (!(await checkQuantity(Item.items))) {
      return {
        statusCode: 403,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Message: "Something wrong! Not enough items in stock for order" + order_id
        })
      };
    }

    const promises = Item.items.map(subtract);
    const data = await Promise.all(promises);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Successfully subtract items from stock of order " + order_id,
        Data: JSON.stringify(data.rows)
      })
    };
  } catch (err) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Something wrong! Unable to subtract items from stock of order" + order_id,
        Error: err
      }),
    };
  }
}