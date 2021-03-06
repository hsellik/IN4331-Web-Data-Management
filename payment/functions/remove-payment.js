console.log("Starting remove payment function");

const AWS = require("aws-sdk");
const region = process.env.AWS_REGION;
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: region });

exports.handler = async function (e, ctx) {

  const order_id = ((e.pathParameters || {})["order_id"]) || (e.order_id);

  var params = {
    TableName: "Payments",
    Key: {
      "order_id": order_id
    },
    ConditionExpression: "order_id = :order_ID and isPaid <> :paid",
    ExpressionAttributeValues: {
      ":order_ID": order_id,
      ":paid": true
    }
  };

  try {
    const data = await dynamoDB.delete(params).promise();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Successfully removed payment! ID: " + order_id,
        Data: JSON.stringify(data)
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        Message: "Payment not found or is currently paid! ID: " + order_id,
        Error: err
      })
    };
  }

};
