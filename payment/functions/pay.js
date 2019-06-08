console.log("Starting pay function");

const AWS = require("aws-sdk");
const region = process.env.AWS_REGION;
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: region });

exports.handler = async function (e, ctx) {

  const order_id = ((e.pathParameters || {})["order_id"]) || (e.order_id);

  // If not in DB, create new with order_id = order_id and isPaid = true
  // If exists, update only, if it is not paid
  // else return error
  var params = {
    TableName: "Payments",
    Key: {
      order_id: order_id
    },
    UpdateExpression: "SET isPaid = :isPaid",
    ConditionExpression: "isPaid <> :isPaid",
    ExpressionAttributeValues: {
      ":isPaid": true
    },
    ReturnValues: "UPDATED_NEW"
  };

  try {
    const data = await dynamoDB.update(params).promise();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Message: "Successfully paid for order! ID: " + order_id,
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
        Message: "Order has already been paid for! ID: " + order_id,
        Error: err
      })
    };
  }
};
