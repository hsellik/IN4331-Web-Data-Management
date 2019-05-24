console.log('Starting payment status function');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'PLACEHOLDER_REGION'});

exports.handler = async function(e, ctx) {

    const order_id = ((e.pathParameters || {})['order_id']) || (e.order_id);

    const params = {
        TableName: 'Payments',
        Key: {
            'Order_ID' : order_id
        }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (data.Item == null) {
            return {
                statusCode: 404,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Message: "Payment not found",
                    Data: JSON.stringify(data)
                }),
            };
        } else {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Message: "Payment successful",
                    Data: JSON.stringify(data)
                }),
            };
        }
    } catch (err) {
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                Message: "Something went wrong!",
                Data: JSON.stringify(data),
                Error: err
            }),
        };
    }
};
