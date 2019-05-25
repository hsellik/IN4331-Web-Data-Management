console.log('Subtract item from stock');

const AWS = require('aws-sdk');
const region = process.env.AWS_REGION;
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: region});

exports.handler = function(e, ctx, callback) {
    let item_id = ((e.path || {})['item_id']) || (e['item_id']);
    let number = ((e.path || {})['number']) || (e['number']);

    number = parseInt(number, 10);

    var params = {
        TableName: 'Stock',
        Key: {
            'Item_ID' : item_id
        },
        UpdateExpression: "SET quantity = quantity - :num",
        ConditionExpression: "quantity >= :num",
        ExpressionAttributeValues:{
            ":num": number
        },
        ReturnValues: "ALL_NEW"
    };

    dynamoDB.update(params, function(err, data) {
        if(err) {
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
};