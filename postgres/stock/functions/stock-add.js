console.log('Add item to stock');

const { Pool, Client } = require('pg')

/**
 * input: {
 *     "item_id"    :   (from path),
 *     "number"     :   (from path)
 * }
 */
exports.handler = async function(e, ctx) {
    const item_id = ((e.path || {})['item_id']) || (e['item_id']);
    let number = ((e.path || {})['number']) || (e['number']);

    number = parseInt(number, 10);

    const pool = new Pool({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
    });

    const updateQuery = {
        text: 'UPDATE Stock SET quantity = quantity + $1 WHERE item_id = $2 RETURNING *',
        values: [number, item_id],
    };

    var data;
    try {
        data = await pool.query(updateQuery);

        return {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Successfully add " + number + " " + item_id + " to the stock",
                Data: JSON.stringify(data.rows)
            }),
        };
    } catch (err) {
        return {
            statusCode: 403,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Something wrong! Unable to add item " + item_id + " to the stock. Perhaps you need to create one.",
                Data: JSON.stringify(data.rows),
                Error: err
            }),
        };
    }
}
