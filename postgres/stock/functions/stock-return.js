console.log('Return item to stock');

const { Pool } = require("pg");

/**
 * input: {
 *     "order_id"   :   (from path), for console log
 *     "Item"       :   (from output json), Item.items is an array of items
 * }
 */
exports.handler = async function(e, ctx) {
    const order_id = ((e.path || {})['order_id']) || (e['order_id']);
    const Item = e['Item'];

    const pool = new Pool({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT
    });

    async function add (item) {
        const updateQuery = {
            text: 'UPDATE Stock SET quantity = quantity + $1 WHERE item_id = $2 RETURNING *',
            values: [item.quantity, item.item_id],
        };
        return await pool.query(updateQuery);
    }

    try {
        const promises = Item.items.map(add);
        const data = await Promise.all(promises);

        return {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Successfully return items of order " + order_id,
                Data: JSON.stringify({Item: data.rows[0]})
            }),
        };
    } catch (err) {
        return {
            statusCode: 403,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Something wrong! Unable to return items of order" + order_id,
                Data: JSON.stringify({Item: data.rows[0]}),
                Error: err
            }),
        };
    }
};
