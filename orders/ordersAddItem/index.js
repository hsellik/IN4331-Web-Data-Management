'use strict';
const AWS = require('aws-sdk');

AWS.config.update({ region: "us-east-1"});

exports.handler = async (event, context) => {
  const ddb = new AWS.DynamoDB({ apiVersion: "2012-10-08"});
  const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1"});

  let responseBody = "";
  let statusCode = 0;

  const { order_id } = event.pathParameters;
  const { item_id } = event.pathParameters;

  const searchOrderParams = {
    TableName: "orders",
    Key: {
      id: order_id
    }
  };

  // TODO: Check if item exists and stock!

  try {
    const data = await documentClient.get(searchOrderParams).promise();
    if (data) {
      // TODO: Possibly check if already paid or not, for now just reset to not paid.
      const putParams = {
        TableName: "orders",
        Item: {
          id: data.id,
          user_id: data.user_id,
          paid: false,
          items: data.items.push(item_id)
        }
      };
      const data = await documentClient.put(putParams).promise();
      responseBody = data
      statusCode = 200;
    } else {
      throw 'OrderID did not exist.'
    }  
  } catch (err) {
    responseBody = "Something went wrong."
    statusCode = 403;
  }
  
  const response = { 
    statusCode: statusCode,
    body: responseBody
  };
  
  return response;

};
