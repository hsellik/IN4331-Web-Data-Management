console.log('Starting credit function');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

exports.handler = async function(e, ctx) {

    const user_id = ((e.pathParameters || {})['user_id']) || (e.user_id);

    const params = {
        TableName: 'Users',
        Key: {
            User_ID : user_id,
        }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (data.Item == null) {
            return {
                statusCode: 404,
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ Message: "User not found" }),
            }
        } else if (data.Item.credit === null) {
            return {
                statusCode: 500,
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ Message: "credit not found in User item", data: data.Item }),
            }
        } else {
            return {
                statusCode: 200,
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ credit: data.Item.credit }),
            }
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ Message: err }),
        }
    }
};