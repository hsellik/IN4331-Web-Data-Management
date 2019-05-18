console.log('Starting payment status function');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

exports.handler = function(e, ctx, callback) {

    let order_id = ((e.path || {})['order_id']) || (e['order_id']);
    order_id = parseInt(order_id, 10);

    const params = {
        TableName: 'Payments',
        Key: {
            'Order_ID' : order_id
        }
    };

    dynamoDB.get(params, function(err, data) {
        if(err) {
            callback(err);
            return;
        }

        if (Object.keys(data).length) {
            const result = {
                "statusCode": 200,
                "headers": {},
                "body": JSON.stringify(data),
                "isBase64Encoded": false
            };
            callback(null, result);
        } else {
            const error = new Error("404 - Order not found");
            callback(error);
        }

    });
};
