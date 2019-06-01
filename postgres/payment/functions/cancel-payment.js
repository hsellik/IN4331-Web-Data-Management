console.log('starting function');

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

    // var params = {
    //     TableName: 'Payments',
    //     Key: {
    //         'Order_ID': order_id
    //     },
    //     UpdateExpression: 'SET isPaid = :notPaid',
    //     ConditionExpression: 'Order_ID = :order_ID and isPaid = :paid',
    //     ExpressionAttributeValues: {
    //         ':order_ID' : order_id,
    //         ':paid': true,
    //         ':notPaid': false
    //     },
    //     ReturnValues: "ALL_NEW"
    // };

    const updateQuery = {
        text: 'UPDATE Payments SET isPaid=FALSE WHERE order_id = $1 AND isPaid IS TRUE RETURNING *',
        values: [order_id],
    };

    // const selectQuery = {
    //     text: 'SELECT * FROM Payments WHERE order_id = $1',
    //     values: [order_id],
    // };

    var data;
    try {
        data = await pool.query(updateQuery);
        // const data = await pool.query(selectQuery);

        return {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Successfully cancelled payment! ID: " + order_id + " Data: " ,
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
                Message: "Payment not found or already cancelled! ID: " + order_id,
                Error: err
            }),
        };
    }
};
