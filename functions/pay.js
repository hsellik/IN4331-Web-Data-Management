console.log('Starting pay function');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

exports.handler = function(e, ctx, callback) {
    let order_id = ((e.path || {})['order_id']) || (e['order_id']);
    let user_id = ((e.path || {})['user_id']) || (e['user_id']);


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

    dynamoDB.update(params, function(err, data) {
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
