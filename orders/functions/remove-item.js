"use strict";
const AWS = require("aws-sdk");
const uuidv4 = require("uuid/v4");

const region = process.env.AWS_REGION;
AWS.config.update({ region: region });

exports.handler = async (event, context) => {
  const ddb = new AWS.DynamoDB({ apiVersion: "2012-10-08" });
  const documentClient = new AWS.DynamoDB.DocumentClient({ region: region });

  let responseBody = "";
  let statusCode = 0;

  const { order_id } = event.pathParameters;
  const { item_id } = event.pathParameters;

  const searchParams = {
    TableName: "Orders",
    Key: {
      order_id: order_id
    }
  };

  try {
    const data = await documentClient.get(searchParams).promise();
    if (data.Item) {
      let found = false;
      data.Item.items.forEach(function (entry) {
        if (entry.order_id == item_id) {
          entry.quantity -= 1;
          found = true;
          data.Item.total_price -= 1;
        }
      });
      if (found == false) {
        throw "Item was not in order.";
      }
      ;
      const updateParams = {
        TableName: "Orders",
        Key: { order_id: order_id },
        ReturnValues: "UPDATED_NEW",
        UpdateExpression: "set #items = :newList, #total_price = :newTotalPrice",
        ExpressionAttributeNames: {
          "#items": "items",
          "#total_price": "total_price"
        },
        ExpressionAttributeValues: {
          ":newList": data.Item.items,
          ":newTotalPrice": data.Item.total_price
        }
      };
      const data = await documentClient.update(updateParams).promise();
      responseBody = JSON.stringify(data);
      statusCode = 200;
    } else {
      throw "Order not found.";
    }
  } catch (err) {
    console.log(err);
    responseBody = "Something went wrong.";
    statusCode = 403;
  }
  ;

  const response = {
    statusCode: statusCode,
    body: responseBody
  };

  return response;

};
