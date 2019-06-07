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
    const orderId = ((event.pathParameters || {})["order_id"]) || (event.order_id);
    const paymentStatusCode = ((event.PaymentStatusResult || {}).statusCode) || 404;

    let removePayment = false;
    if (paymentStatusCode === 200) {
      const response = JSON.parse(event.PaymentStatusResult.body);
      removePayment = (response.Data.isPaid === false);
    }

    const params = {
      TableName: "orders",
      Key: {
        Order_ID: orderId
      }
    };

    if (paymentStatusCode === 404 || removePayment) {
      await documentClient.delete(params).promise();
      responseBody = orderId;
      statusCode = 200;
    } else {
      responseBody = JSON.stringify({ Message: "Order is already paid and thus not removed" });
      statusCode = 200;
    }
  } catch (err) {
    console.log(err);
    responseBody = "Something went wrong.";
    statusCode = 500;
  }

  const response = {
    statusCode: statusCode,
    headers: headers,
    removePayment: removePayment,
    body: responseBody
  };

  return response;

};
