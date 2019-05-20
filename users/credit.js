console.log('Starting credit function');

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({region: 'us-west-1'});

exports.handler = function(e, ctx, callback) {

    const user_id = ((e.path || {})['user_id']) || (e.user_id);

    const params = {
        TableName: 'Users',
        Key: {
            User_ID : user_id,
        }
    };

    dynamoDB.get(params, function(err, data) {
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
            callback(null, {
                statusCode: 200,
                headers: { "Content-type": "application/json" },
                body: { credit: data.Item.credit }
            });
        }
    });
};