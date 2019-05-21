console.log('Starting remove user function');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

exports.handler = function(e, ctx, callback) {

    const user_id = ((e.path || {})['user_id']) || (e.user_id);

    const params = {
        TableName: 'Users',
        Key: {
            User_ID : user_id,
        }
    };

    dynamoDB.delete(params, function(err, data) {
        if(err) {
            callback(err, {
                statusCode: 500
            });
        } else {
            callback(null, {
                statusCode: 200,
                headers: {},
                body: data,
                isBase64Encoded: false,
            });
        }
    });
};