'use strict';
const AWS = require('aws-sdk');

const region = process.env.AWS_REGION;
AWS.config.update({ region: region});

exports.handler = async (event, context) => {
  const ddb = new AWS.DynamoDB({ apiVersion: "2012-10-08"});
  const documentClient = new AWS.DynamoDB.DocumentClient({ region: region});

  let responseBody = "";
  let statusCode = 0;

  const { order_id } = event.pathParameters;

  const params = {
    TableName: "orders",
    Key: {
      Order_ID: order_id
    }
  };

  const deleteQuery = {
    text: 'DELETE FROM Order WHERE EXISTS order_id = $1',
    values: [order_id],
  };

  try {
    await documentClient.delete(params).promise();
    responseBody = order_id;
    statusCode = 200;
  } catch (err) {
    responseBody = "Something went wrong.";
    statusCode = 403;
  }

  const response = {
    statusCode: statusCode,
    body: responseBody
  };

  return response;

};
