console.log("Starting create user function");

const uuid = require("uuid/v1");
const AWS = require("aws-sdk");
const region = process.env.AWS_REGION;
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: region });

exports.handler = async function (e, ctx) {
  const user_id = uuid();

  const params = {
    TableName: "Users",
    Item: {
      user_id: user_id,
      credit: 0
    }
  };

  try {
    const data = await dynamoDB.put(params).promise();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user_id
      }),
      isBase64Encoded: false
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Message: err }),
      isBase64Encoded: false
    };
  }
};
