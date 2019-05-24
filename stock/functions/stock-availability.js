console.log('Check stock availability');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'PLACEHOLDER_REGION'});

exports.handler = async function(e, ctx) {
    const item_id = ((e.path || {})['item_id']) || (e['item_id']);

    const params = {
        TableName: 'Stock',
        Key: {
            'Item_ID' : item_id
        }
    };

    var data;
    try {
        data = await dynamoDB.get(params).promise();

        return {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Successfully get availability of item " + item_id,
                Data: JSON.stringify(data)
            }),
        };
    } catch (err) {
        return {
            statusCode: 403,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Something wrong! No " + item_id + " in the stock.",
                Data: JSON.stringify(data),
                Error: err
            }),
        };
    }
}
