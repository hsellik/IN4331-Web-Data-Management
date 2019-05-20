console.log('Starting remove payment function');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

exports.handler = function(e, ctx, callback) {

    let order_id = ((e.path || {})['order_id']) || (e['order_id']);

    var params = {
        TableName: 'Payments',
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