console.log("Create new item in stock");

const uuidv1 = require('uuid/v1');
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

exports.handler = function(e, ctx, callback) {
    const item_id = uuidv1();

    var params = {
        TableName: 'Stock',
        Item:{
            "Item_ID": item_id,
            "quantity": 1
        }
    };

    dynamoDB.put(params, function(err, data) {
        if (err) {
            callback(err);
        } else {
            const result = {
                "statusCode": 200,
                "headers": {},
                "body": JSON.stringify(data),
                "isBase64Encoded": false
            };
            callback(null, result);
        }
    });
}
