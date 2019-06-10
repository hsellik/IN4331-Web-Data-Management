console.log('Starting remove user function');

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

    const deleteQuery = {
        text: 'DELETE FROM Users WHERE user_id = $1 RETURNING *',
        values: [user_id],
    };

    let client;
    try {
        client = await pool.connect();
        const data = await client.query(deleteQuery);
        client.release();
        if (data.rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ Message: "User not found" })
            }
        } else {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Message: `Deleted user ${user_id}` }),
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
