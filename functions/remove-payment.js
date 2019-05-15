console.log('starting function');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

exports.handler = function(e, ctx, callback) {

    const order_id = e.pathParameters.order_id;

    var params = {
        TableName: 'Payment',
        Key: {
            'Order_ID' : order_id
        }
    };

    dynamoDB.delete(params, function(err, data) {
        if(err) {
            callback(err, null);

        } else {
            callback(null, data);
        }
    });
};