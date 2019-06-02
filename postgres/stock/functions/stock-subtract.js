console.log('Subtract items from stock for order');

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

    // TO DO: Get the availability of all items before trying to subtract because
    //        it would still subtract items that available even though some items are not.
    async function subtract (item) {
        const updateQuery = {
            text: 'UPDATE Stock SET quantity = quantity - $1 WHERE item_id = $2',
            values: [item.quantity, item.Item_ID],
        };
        // return await dynamoDB.update(params).promise();
        return await pool.query(updateQuery);
    }

    try {
        const promises = Item.items.map(subtract);
        const data = await Promise.all(promises);

        return {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Successfully subtract items from stock of order " + order_id,
                Data: JSON.stringify(data)
            }),
        };
    } catch (err) {
        return {
            statusCode: 403,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Something wrong! Unable to subtract items from stock of order" + order_id,
                Data: JSON.stringify(data),
                Error: err
            }),
        };
    }
}
