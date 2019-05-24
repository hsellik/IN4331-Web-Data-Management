console.log('Return item to stock');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'PLACEHOLDER_REGION'});

exports.handler = async function(e, ctx) {
    const order_id = ((e.path || {})['order_id']) || (e['order_id']);
    const Item = e['Item'];

    async function add (item) {
        var params = {
            TableName: 'Stock',
            Key: {
                'Item_ID' : item.Item_ID
            },
            UpdateExpression: "SET quantity = quantity + :num",
            ExpressionAttributeValues:{
                ":num": item.quantity
            },
            ReturnValues: "ALL_NEW"
        };
        return await dynamoDB.update(params).promise();
    }

    var data;
    try {
        const promises = Item.items.map(add);
        data = await Promise.all(promises);

        return {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Successfully return items of order " + order_id,
                Data: JSON.stringify(data)
            }),
        };
    } catch (err) {
        return {
            statusCode: 403,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                Message: "Something wrong! Unable to return items of order" + order_id,
                Data: JSON.stringify(data),
                Error: err
            }),
        };
    }
}
