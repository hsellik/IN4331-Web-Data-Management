console.log('Check stock availability');

const AWS = require('aws-sdk');
const region = process.env.AWS_REGION;
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: region});

exports.handler = async function(e, ctx) {
    let item_id = ((e.pathParameters || {})['item_id']) || (e.item_id);

    const params = {
        TableName: 'Stock',
        Key: {
            'Item_ID' : item_id
        }
    };

    try {
        const data = await dynamoDB.get(params);
        if (data.Item == null) {
            return {
                statusCode: 404,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Message: data })
            }
        } else {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data.Item)
            };
        }
    } catch (err) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Message: err })
        }
    }

};