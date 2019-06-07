"use strict";
const AWS = require("aws-sdk");

const region = process.env.AWS_REGION;
AWS.config.update({ region: region });

exports.handler = async (event, context) => {
  const ddb = new AWS.DynamoDB({ apiVersion: "2012-10-08" });
  const documentClient = new AWS.DynamoDB.DocumentClient({ region: region });

  let responseBody = "";
  let statusCode = 0;
  let headers = { "Content-Type": "application/json" };

  try {
    const orderId = ((event.pathParameters || {})['order_id']) || (event.order_id);

    const params = {
      TableName: "Orders",
      Key: {
        Order_ID: orderId
      }
    };

    await documentClient.delete(params).promise();
    responseBody = { OrderId: orderId };
    statusCode = 200;

  } catch (err) {
    console.log(err);
    responseBody = { Message: "Something went wrong." };
    statusCode = 500;
  }

  const response = {
    statusCode: statusCode,
    headers: headers,
    body: JSON.stringify(responseBody)
  };

  return response;

};
