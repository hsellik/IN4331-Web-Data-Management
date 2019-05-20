console.log('Starting credit add function');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'us-west-1'});

exports.handler = function(e, ctx, callback) {

    const user_id = ((e.path || {})['user_id']) || (e.user_id);
    const amountRaw = ((e.path || {})['amount']) || e.amount;

    const amount = parseInt(amountRaw, 10);
    if (amount == NaN) { // TODO: This doesn't seem to work, not sure why
        callback(null, {
            statusCode: 400,
            headers: { "Content-type": "application/json" },
            body: { message: `Amount parameter is not a number: \"${amountRaw}\"` },
        });
        return;
    }

    const getParams = {
        TableName: 'Users',
        Key: {
            User_ID : user_id,
        }
    };

    dynamoDB.get(getParams, function(err, data) {
        if(err) {
            callback(err, {
                statusCode: 500,
            });
        } else if (data.Item == null) {
            callback(null, {
                statusCode: 404,
                headers: { "Content-type": "application/json" },
                body: { message: "User not found" },
            });
        } else if (data.Item.credit === null) {
            callback(err, {
                statusCode: 500,
                headers: { "Content-type": "application/json" },
                body: { message: `credit not found in User item: ${JSON.stringify(data.Item)}` },
            });
        } else {
            const updateParams = {
                TableName: 'Users',
                Key: { User_ID: user_id },
                UpdateExpression: "SET credit = credit + :amount",
                ExpressionAttributeValues: { ":amount": amount },
                ReturnValues: "NONE"
            }

            dynamoDB.update(updateParams, function(err, data) {
                if (err) {
                    callback(err, {
                        statusCode: 500,
                    });
                } else {
                    callback(null, {
                        statusCode: 200,
                        headers: { "Content-type": "application/json" },
                        body: data,
                    });
                }
            });
        }
    });
};