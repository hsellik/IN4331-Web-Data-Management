console.log("Starting credit add function");

const AWS = require("aws-sdk");
const region = process.env.AWS_REGION;
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: region });

exports.handler = async function (e, ctx) {

  const user_id = ((e.pathParameters || {})["user_id"]) || e.user_id;
  const amountRaw = ((e.pathParameters || {})["amount"]) || e.amount;

  const amount = parseInt(amountRaw, 10);
  if (Number.isNaN(amount)) {
    callback(null, { // @comment undefined?
      statusCode: 400,
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ message: `Amount parameter is not a number: \"${amountRaw}\"` })
    });
    return;
  }

  const getParams = {
    TableName: "Users",
    Key: {
      User_ID: user_id
    }
  };

  try {
    const data = await dynamoDB.get(getParams).promise();
    if (data.Item == null) {
      return {
        statusCode: 404,
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ Message: "User not found" })
      };
    } else if (data.Item.credit === null) {
      return {
        statusCode: 500,
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ Message: "credit not found in User item.", item: data.Item })
      };
    } else {
      try {
        const updateParams = {
          TableName: "Users",
          Key: { User_ID: user_id },
          UpdateExpression: "SET credit = credit + :amount",
          ExpressionAttributeValues: { ":amount": amount },
          ReturnValues: "ALL_NEW"
        };
        const data = await dynamoDB.update(updateParams).promise();
        return {
          statusCode: 200,
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({ ...data.Attributes })
        };
      } catch (err) {
        return {
          statusCode: 500,
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({ Message: err })
        };
      }
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ Message: err })
    };
  }
};
