console.log('Starting credit function');

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
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ Message: "User not found" }),
            }
        } else if (data.rows.credit === null) {
            return {
                statusCode: 500,
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ Message: "Credit not found in User item", data: data.rows[0] }),
            }
        } else {
            return {
                statusCode: 200,
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ credit: data.rows[0].credit }),
            }
        }
    } catch (err) {
        if (client) client.release();
        return {
            statusCode: 500,
            body: JSON.stringify({ Message: err }),
        }
    }
};
