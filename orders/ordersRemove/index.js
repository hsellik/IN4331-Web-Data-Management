'use strict';
const AWS = require('aws-sdk');

AWS.config.update({ region: "us-east-1"});

exports.handler = async (event, context) => {
  const ddb = new AWS.DynamoDB({ apiVersion: "2012-10-08"});
  const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1"});

  let responseBody = "";
  let statusCode = 0;

  const { order_id } = event.pathParameters;

  const params = {
    TableName: "orders",
    Key: {
      id: order_id
    }
  };

  try {
    await documentClient.delete(params).promise();
    responseBody = order_id;
    statusCode = 200;
  } catch (err) {
    responseBody = "Something went wrong."
    statusCode = 403;
  }

  // ADD removal of items in order_rows table
  
  const response = { 
    statusCode: statusCode,
    body: responseBody
  };
  
  return response;

};
