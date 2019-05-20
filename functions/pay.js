console.log('Starting pay function');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

exports.handler = function(e, ctx, callback) {
    let order_id = ((e.path || {})['order_id']) || (e['order_id']);
    let user_id = ((e.path || {})['user_id']) || (e['user_id']);

    var params = {
        TableName: 'Payments',
        Item: {
            'Order_ID' : order_id,
            'isPaid' : true
        }
    };

    // @TODO also check if it already exists in the DB, but isPaid is set to false.
    // If in that case isPaid is set to true, throw error

    dynamoDB.put(params, function(err, data) {
        var success = {
            "statusCode": 200,
            "headers": {},
            "body": JSON.stringify(data),
            "isBase64Encoded": false
        };

        if(err) {
            callback(err);

        } else {
            callback(null, success);
        }
    });
};
