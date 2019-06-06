console.log('Substract item from stock');

const AWS = require('aws-sdk');
const region = process.env.AWS_REGION;
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: region});

/**
 * input: {
 *     "item_id"    :   (from path),
 *     "number"     :   (from path)
 * }
 */
exports.handler = async function(e, ctx) {
    const item_id = ((e.path || {})['item_id']) || (e['item_id']) || ((e.pathParameters || {})['item_id']);
    let number = ((e.path || {})['number']) || (e['number']) || ((e.pathParameters || {})['number']);

    number = parseInt(number, 10);

    const params = {
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

    var data;
    try {
        data = await dynamoDB.update(params).promise();

        return {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Successfully substracted " + number + " " + item_id + " from the stock",
                Data: JSON.stringify(data)
            }),
        };
    } catch (err) {
        console.log("TEST TEST")
        return {
            statusCode: 403,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Something wrong! Unable to substract item " + item_id + " from the stock.",
                Data: JSON.stringify(data),
                Error: err
            }),
        };
    }
}
