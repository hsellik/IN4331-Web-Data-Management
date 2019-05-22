console.log('Check stock availability');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

exports.handler = function(e, ctx, callback) {
    let item_id = ((e.path || {})['item_id']) || (e['item_id']);

    var params = {
        TableName: 'Stock',
        Key: {
            'Item_ID' : item_id
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
            const error = new Error("404 - Item not found");
            callback(error);
        }

    });

}