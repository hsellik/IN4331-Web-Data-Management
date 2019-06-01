console.log('Starting payment status function');

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

    const selectQuery = {
        text: 'SELECT * FROM Payments WHERE order_id = $1',
        values: [order_id],
    };

    var data;
    try {
        data = await pool.query(selectQuery);
        if (data.rows.length == 0) {
            return {
                statusCode: 404,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Message: "Payment not found",
                    Data: JSON.stringify(data.rows)
                }),
            };
        } else {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Message: "Payment successful",
                    Data: JSON.stringify(data.rows)
                }),
            };
        }
    } catch (err) {
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Message: "Something went wrong!",
                Error: err
            }),
        };
    }
};