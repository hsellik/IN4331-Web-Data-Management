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
    const updateParams = {
      TableName: 'orders',
      Key: { id: order_id },
      ReturnValues: 'ALL_NEW',
      UpdateExpression: 'set #items = list_append(if_not_exists(#items, :empty_list), :item_id)',
      ExpressionAttributeNames: {
        '#items': 'items'
      },
      ExpressionAttributeValues: {
        ':item_id': [item_id],
        ':empty_list': []
      }
    }
    const data = await documentClient.update(updateParams).promise();
    responseBody = data
    statusCode = 200;
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
