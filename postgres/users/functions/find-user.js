console.log('Starting find user function');

const { Pool } = require('pg');

exports.handler = async function(e, ctx) {

    const user_id = ((e.pathParameters || {})['user_id']) || (e.user_id);

    const pool = new Pool({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
    });

    const selectQuery = {
        text: 'SELECT * FROM Users WHERE user_id = $1',
        values: [user_id],
    };

    let client;
    try {
        client = await pool.connect();
        const data = await client.query(selectQuery);
        client.release();
        if (data.rows.length === 0) {
            return {
                statusCode: 404,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ Message: "User not found" }),
                isBase64Encoded: false,
            };
        } else {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data.rows[0]),
                isBase64Encoded: false,
            };
        }
    } catch (err) {
        if (client) client.release();
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ Message: err }),
            isBase64Encoded: false,
        };
    }
};
