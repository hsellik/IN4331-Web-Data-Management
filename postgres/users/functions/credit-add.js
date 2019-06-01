console.log('Starting credit add function');

const { Pool, Client } = require('pg')

exports.handler = async function(e, ctx) {

    const user_id = ((e.pathParameters || {})['user_id']) || e.user_id;
    const amountRaw = ((e.pathParameters || {})['amount']) || e.amount;

    const pool = new Pool({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
    });

    const amount = parseInt(amountRaw, 10);
    if (amount >= 0) {
        return {
            statusCode: 400,
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ message: `Amount parameter is not a number: \"${amountRaw}\"` }),
        }
    }

    const selectQuery = {
        text: 'SELECT * FROM Users WHERE user_id = $1',
        values: [user_id],
    };

    const updateQuery = {
        text: 'UPDATE Users SET credit = credit + $1 WHERE user_id = $2 RETURNING *',
        values: [amount, user_id],
    };

    var data;
    try {
        data = await pool.query(updateQuery);
        if (data.rows.length == 0) {
            return {
                statusCode: 404,
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ Message: "User not found" }),
            }
        } else if (data.rows.credit === null) {
            return {
                statusCode: 500,
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ Message: "credit not found in User item.", item: data.rows }),
            }
        }
        return {
            statusCode: 200,
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(data.rows),
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ Message: err }),
        }
    }
};
