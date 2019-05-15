console.log('Starting remove payment function');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

exports.handler = function(e, ctx, callback) {

    const order_id = parseInt(e.pathParameters.order_id, 10);

    var params = {
        TableName: 'Payment',
        Key: {
            'Order_ID' : order_id
        }
    };

    dynamoDB.delete(params, function(err, data) {
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