console.log('Starting pay function');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

exports.handler = function(e, ctx, callback) {

    const order_id = parseInt(e.pathParameters.order_id, 10);
    const user_id = parseInt(e.pathParameters.user_id, 10);

    var params = {
        TableName: 'Payment',
        Item: {
            'Order_ID' : order_id,
            'isPaid' : true
        }
    };

    dynamoDB.put(params, function(err, data) {
        var success = {
            "statusCode": 200,
            "headers": {},
            "body": JSON.stringify(data),
            "isBase64Encoded": false
        };

        if(err) {
            callback(err, null);

        } else {
            callback(null, success);
        }
    });
};