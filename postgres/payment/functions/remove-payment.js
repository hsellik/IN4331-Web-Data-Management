console.log('Starting remove payment function');

const { Pool } = require('pg');

exports.handler = async function(e, ctx) {

    const order_id = ((e.pathParameters || {})['order_id']) || (e.order_id);

    const pool = new Pool({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
    });

    const deleteQuery = {
        text: 'DELETE FROM Payments WHERE order_id = $1 AND isPaid = FALSE RETURNING *',
        values: [order_id],
    };

    let client;
    try {
        client = await pool.connect();
        const data = await client.query(deleteQuery);

        client.release();
        if (data.rows.length === 0) {
            return {
                statusCode: 404,
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ Message: "Payment not found" })
            };
        }

        return {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Successfully removed payment! ID: " + order_id,
                Data: JSON.stringify({Item: data.rows[0]})
            }),
        };
    } catch (err) {
        client.release();
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Message: "Payment not found or is currently paid! ID: " + order_id,
                Error: err
            }),
        };
    }

};
