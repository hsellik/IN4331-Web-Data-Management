console.log('Starting pay function');

const AWS = require('aws-sdk');
const region = process.env.AWS_REGION;
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: region});

exports.handler = async function (e, ctx) {

    const order_id = ((e.pathParameters || {})['order_id']) || (e.order_id);
    const user_id = ((e.pathParameters || {})['user_id']) || (e.user_id);


    // If not in DB, create new with Order_ID = order_id and isPaid = true
    // If exists, update only, if it is not paid
    // else return error
    var params = {
        TableName: "Payments",
        Key: {
            Order_ID: order_id
        },
        UpdateExpression: "SET isPaid = :isPaid",
        ConditionExpression: 'isPaid <> :isPaid',
        ExpressionAttributeValues: {
            ":isPaid": true
        },
        ReturnValues: "UPDATED_NEW"
    };

    const selectQuery = {
        text: 'SELECT * FROM Payments WHERE order_id = $1',
        values: [order_id],
    };

    const updateQuery = {
        text: 'UPDATE Payments SET isPaid=TRUE WHERE order_id = $1',
        values: [order_id],
    };

    try {
        const data = await dynamoDB.update(params).promise();

        return {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Successfully paid for order! ID: " + order_id,
                Data: JSON.stringify(data)
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
