console.log("Starting remove user function");

const AWS = require("aws-sdk");
const region = process.env.AWS_REGION;
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: region });

exports.handler = async function (e, ctx) {

  const user_id = ((e.pathParameters || {})["user_id"]) || (e.user_id);

  const params = {
    TableName: "Users",
    Key: {
      User_ID: user_id
    }
  };

  try {
    const data = await dynamoDB.get(params).promise();
    if (data.Item == null) {
      return {
        statusCode: 404,
        body: JSON.stringify({ Message: "User not found" })
      };
    } else {
      try {
        const data = await dynamoDB.delete(params).promise();
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Message: `Deleted user ${user_id}` })
        };
      } catch (err) {
        return {
          statusCode: 500,
          body: JSON.stringify({ Message: err })
        };
      }
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ Message: err })
    };
  }
};
