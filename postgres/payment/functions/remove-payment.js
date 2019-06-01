console.log('Starting remove payment function');

const { Pool, Client } = require('pg')

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
        text: 'DELETE FROM Payments WHERE EXISTS order_id = $1 AND isPaid = FALSE RETURNING ',
        values: [order_id],
    };

    var data;
    try {
        data = await pool.query(deleteQuery);

        return {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Successfully removed payment! ID: " + order_id,
                Data: JSON.stringify(data.rows)
            }),
        };
    } catch (err) {
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