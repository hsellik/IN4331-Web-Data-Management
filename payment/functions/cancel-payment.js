console.log('starting function');

const AWS = require('aws-sdk');
const region = process.env.AWS_REGION;
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: region});

exports.handler = async function(e, ctx) {

    const order_id = ((e.pathParameters || {})['order_id']) || (e.order_id);

    var params = {
        TableName: 'Payments',
        Key: {
            'Order_ID': order_id
        },
        UpdateExpression: 'SET isPaid = :notPaid',
        ConditionExpression: 'Order_ID = :order_ID and isPaid = :paid',
        ExpressionAttributeValues: {
            ':order_ID' : order_id,
            ':paid': true,
            ':notPaid': false
        },
        ReturnValues: "ALL_NEW"
    };

    const updateQuery = {
        text: 'UPDATE Payments SET isPaid=FALSE WHERE order_id = $1 AND isPaid IS TRUE',
        values: [order_id],
    };

    try {
        const data = await dynamoDB.update(params).promise();

        return {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Successfully cancelled payment! ID: " + order_id + " Data: " ,
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
                Message: "Payment not found or already cancelled! ID: " + order_id,
                Error: err
            }),
        };
    }
};
