'use strict';
const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

const region = process.env.AWS_REGION;
AWS.config.update({ region: region});

exports.handler = async (event, context) => {
  const ddb = new AWS.DynamoDB({ apiVersion: "2012-10-08"});
  const documentClient = new AWS.DynamoDB.DocumentClient({ region: region});

  let responseBody = "";
  let statusCode = 0;

  const { order_id } = event.pathParameters;
  const { item_id } = event.pathParameters;

  const searchParams = {
    TableName: "Orders",
    Key: {
      Order_ID: order_id
    }
  };

  try {
    const data = await documentClient.get(searchParams).promise();
    if (data.Item) {
      let found = false;
      data.Item.items.forEach(function(entry) {
        if (entry.Item_ID == item_id) {
          entry.quantity -= 1;
          found = true;
        }
      });
      if (found == false) {
        throw 'Item was not in order.'
      };
      const updateParams = {
        TableName: 'Orders',
        Key: { Order_ID: order_id },
        ReturnValues: 'UPDATED_NEW',
        UpdateExpression: 'set #items = :newList',
        ExpressionAttributeNames: {
          '#items': 'items'
        },
        ExpressionAttributeValues: {
          ':newList': data.Item.items
        }
      };
      const data = await documentClient.update(updateParams).promise();
      responseBody = JSON.stringify(data);
      statusCode = 200;
    } else {
      throw 'Order not found.';
    }  
  } catch (err) {
    console.log(err);
    responseBody = "Something went wrong.";
    statusCode = 403;
  };
  
  const response = { 
    statusCode: statusCode,
    body: responseBody
  };
  
  return response;

};
