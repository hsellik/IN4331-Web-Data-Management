'use strict';
const AWS = require('aws-sdk');

const region = process.env.AWS_REGION;
AWS.config.update({ region: region});

exports.handler = async (event, context) => {
  const ddb = new AWS.DynamoDB({ apiVersion: "2012-10-08"});
  const documentClient = new AWS.DynamoDB.DocumentClient({ region: region});

  let responseBody = "";
  let statusCode = 0;
  let responseHeaders = { "Content-Type": "application/json" };

  const orderId = ((event.pathParameters || {})['order_id']) || (event.order_id);

  const searchParams = {
    TableName: "Orders",
    Key: {
      Order_ID: orderId
    }
  };

  try {
    const data = await documentClient.get(searchParams).promise();
    if (data.Item) {
      statusCode = 200;
      responseBody = JSON.stringify({
        ...data,
      });
    } else {
      statusCode = 404;
      responseBody = JSON.stringify({ Message: 'Could not find order' });
    }  
  } catch (err) {
    console.log(err);
    responseBody = JSON.stringify({ Message: "Something went wrong" });
    statusCode = 500;
  }
  
  const response = { 
    statusCode: statusCode,
    headers: responseHeaders,
    body: responseBody,
  };
  
  return response;

};
