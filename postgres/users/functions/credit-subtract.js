console.log('Starting credit subtract function');

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
        text: 'UPDATE Users SET credit = credit - $1 WHERE credit >= $1 AND user_id = $2',
        values: [amount, user_id],
    };

    try {
        const data = await dynamoDB.get(getParams).promise();
        if (data.Item == null) {
            return {
                statusCode: 404,
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ Message: "User not found" }),
            }
        } else if (data.Item.credit === null) {
            return {
                statusCode: 500,
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ Message: "credit not found in User item.", item: data.Item }),
            }
        } else if (data.Item.credit < amount) {
            return {
                statusCode: 412,
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ Message: `Credit not sufficient; current credit: ${data.Item.credit}` }),
            };
        } else {
            try {
                const updateParams = {
                    TableName: 'Users',
                    Key: { User_ID: user_id },
                    UpdateExpression: "SET credit = credit - :amount",
                    ConditionExpression: "credit >= :amount",   // This is a sanity check, has been checked in code before
                                                                // but something might have changed
                    ExpressionAttributeValues: { ":amount": amount },
                    ReturnValues: "ALL_NEW"
                }
                const data = await dynamoDB.update(updateParams).promise();
                return {
                    statusCode: 200,
                    headers: { "Content-type": "application/json" },
                    body: JSON.stringify({ ...data.Attributes }),
                };
            } catch (err) {
                return {
                    statusCode: 500,
                    headers: { "Content-type": "application/json" },
                    body: JSON.stringify({ Message: err }),
                }
            }
        }
    } catch (err) {
        return {
            statusCode: 500,
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ Message: err }),
        }
    }
};
