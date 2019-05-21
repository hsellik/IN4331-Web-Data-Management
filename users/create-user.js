console.log('Starting create user function');

const uuid = require('uuid/v1');
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

exports.handler = function(e, ctx, callback) {
    const user_id = uuid();

    const params = {
        TableName: 'Users',
        Item: {
            User_ID : user_id,
            credit : 0
        }
    };

    dynamoDB.put(params, function(err, data) {
        if(err) {
            callback(err, {
                statusCode: 500
            });
        } else {
            callback(null, {
                statusCode: 200,
                headers: {},
                body: {
                    User_ID: user_id,
                },
                isBase64Encoded: false,
            });
        }
    });
};
