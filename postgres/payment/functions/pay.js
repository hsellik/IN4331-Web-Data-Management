console.log('Starting pay function');

const { Pool, Client } = require('pg')

exports.handler = async function (e, ctx) {

    const order_id = ((e.pathParameters || {})['order_id']) || (e.order_id);
    const user_id = ((e.pathParameters || {})['user_id']) || (e.user_id);

    const pool = new Pool({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
    });

    const insertQuery = {
        text: "INSERT INTO Payments(order_id, isPaid) \
            SELECT $1, TRUE \
            WHERE NOT EXISTS ( \
                SELECT $1 FROM Payments \
            );",
        values: [order_id],
    }

    const updateQuery = {
        text: 'UPDATE Payments SET isPaid=TRUE WHERE order_id = $1',
        values: [order_id],
    };

    try {
        const insert = await pool.query(insertQuery);
        if (insert.rows.length === 0) {
            await pool.query(updateQuery);
        }

        return {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Successfully paid for order! ID: " + order_id,
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
                Message: "Order has already been paid for! ID: " + order_id,
                Error: err
            }),
        };
    }
};
