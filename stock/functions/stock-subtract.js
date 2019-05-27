console.log('Subtract items from stock for order');

const AWS = require('aws-sdk');
const region = process.env.AWS_REGION;
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: region});

/**
 * input: {
 *     "order_id"   :   (from path), for console log
 *     "Item"       :   (from output json), Item.items is an array of items
 * }
 */
exports.handler = async function(e, ctx) {
    const order_id = ((e.path || {})['order_id']) || (e['order_id']);
    const Item = e['Item'];

    // TO DO: Get the availability of all items before trying to subtract because
    //        it would still subtract items that available even though some items are not.
    async function subtract (item) {
        var params = {
            TableName: 'Stock',
            Key: {
                'Item_ID' : item.Item_ID
            },
            UpdateExpression: "SET quantity = quantity - :num",
            ConditionExpression: "quantity >= :num",
            ExpressionAttributeValues:{
                ":num": item.quantity
            },
            ReturnValues: "ALL_NEW"
        };
        return await dynamoDB.update(params).promise();
    }

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
