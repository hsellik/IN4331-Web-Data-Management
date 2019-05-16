console.log('starting function');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

exports.handler = function(e, ctx, callback) {

    const order_id = parseInt(e.pathParameters.order_id, 10);

    var params = {
        TableName: 'Payment',
        Key: {
            'Order_ID': order_id
        },
        UpdateExpression: 'SET isPaid = :isPaid',
        ConditionExpression: 'Order_ID = :order_ID and isPaid <> :isPaid',
        ExpressionAttributeValues: {
            ':order_ID' : order_id,
            ':isPaid': false
        },
        ReturnValues: "ALL_NEW"
    };

    dynamoDB.update(params, function(err, data) {
        if(err) {
            callback(err, null);
        } else {
            callback(null, data);
        }
    });
}