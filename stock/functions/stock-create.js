console.log("Create new item in stock");

const uuidv1 = require('uuid/v1');
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'PLACEHOLDER_REGION'});

exports.handler = async function(e, ctx) {
    const item_id = uuidv1();

    const params = {
        TableName: 'Stock',
        Item:{
            "Item_ID": item_id,
            "quantity": 100
        }
    };

    try {
        const data = await dynamoDB.put(params).promise();

        return {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Successfully create item " + item_id,
                Data: JSON.stringify(data)
            }),
        };
    } catch (err) {
        return {
            statusCode: 403,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Unable to create item.",
                Data: JSON.stringify(data),
                Error: err
            }),
        };
    }
}
