console.log('Starting create user function');

const uuid = require('uuid/v1');
const { Pool } = require('pg');

exports.handler = async function(e, ctx) {
    const user_id = uuid();

    const pool = new Pool({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
    });

    const query = {
        text: 'INSERT INTO Users(user_id, credit) VALUES($1, $2) RETURNING *',
        values: [user_id, 0],
    };

    try {
        const data = await pool.query(query);
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                User_ID: user_id
            }),
            isBase64Encoded: false,
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Message: err }),
            isBase64Encoded: false,
        }
    }
};
