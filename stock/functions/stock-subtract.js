console.log('Subtract items from stock for order');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'PLACEHOLDER_REGION'});

exports.handler = async function(e, ctx) {
    const order_id = ((e.path || {})['order_id']) || (e['order_id']);
    const Item = e['Item'];

    async function subtract (item) {
        var params = {
            TableName: 'Stock',
            Key: {
                'Item_ID' : item.Item_ID
            },
            UpdateExpression: "SET quantity = quantity - :num",
            ExpressionAttributeValues:{
                ":num": item.quantity
            },
            ReturnValues: "ALL_NEW"
        };
        return await dynamoDB.update(params).promise();
    }

    // let data = Array(Item.length);
    var data;
    try {
        const promises = Item.items.map(subtract);
        data = await Promise.all(promises);

        return {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Successfully subtract items from stock of order " + order_id,
                Data: JSON.stringify(data)
            }),
        };
    } catch (err) {
        return {
            statusCode: 403,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Something wrong! Unable to subtract items from stock of order" + order_id,
                Data: JSON.stringify(data),
                Error: err
            }),
        };
    }
}
