'use strict';
const AWS = require('aws-sdk');

const region = process.env.AWS_REGION;
AWS.config.update({ region: region});

exports.handler = async (event, context) => {
  const ddb = new AWS.DynamoDB({ apiVersion: "2012-10-08"});
  const documentClient = new AWS.DynamoDB.DocumentClient({ region: region});

  let responseBody = "";
  let statusCode = 0;

  const order_id = ((event.pathParameters || {})['order_id']) || (event.order_id);

  const searchParams = {
    TableName: "Orders",
    Key: {
      Order_ID: order_id
    }
  };

  try {
    const data = await documentClient.get(searchParams).promise();
    if (data.Item) {
      statusCode = 200;
      responseBody = JSON.stringify(data);
    } else {
      statusCode = 404;
      responseBody = JSON.stringify({ Message: 'Could not find order' });
    }  
  } catch (err) {
    console.log(err);
    responseBody = "Something went wrong.";
    statusCode = 403;
  }
  
  const response = { 
    statusCode: statusCode,
    body: responseBody
  };
  
  return response;

};
