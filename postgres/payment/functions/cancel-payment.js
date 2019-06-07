console.log('starting function');

const { Pool } = require('pg')

exports.handler = async function(e, ctx) {

    const order_id = ((e.pathParameters || {})['order_id']) || (e.order_id);

    const pool = new Pool({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
    });

    const updateQuery = {
        text: 'UPDATE Payments SET isPaid=FALSE WHERE order_id = $1 AND isPaid IS TRUE RETURNING *',
        values: [order_id],
    };

    try {
        const data = await pool.query(updateQuery);
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
                Message: "Successfully cancelled payment! ID: " + order_id + " Data: " ,
                Data: JSON.stringify({Item: data.rows[0]})
            }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Message: "Payment not found or already cancelled! ID: " + order_id,
                Error: err
            }),
        };
    }
};
