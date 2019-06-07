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

  const orderId = ((event.pathParameters || {})["order_id"]) || (event.order_id);
  const itemId = ((event.pathParameters || {})["item_id"]) || (event.item_id);

  const searchParams = {
    TableName: "Orders",
    Key: {
      Order_ID: orderId
    }
  };

  try {
    const data = await documentClient.get(searchParams).promise();
    if (data.Item != null) {
      let found = false;
      data.Item.items.forEach(function (entry) {
        if (entry.Item_ID == itemId) {
          entry.quantity += 1;
          found = true;
        }
      });
      if (!found) {
        data.Item.items.push({ Item_ID: itemId, quantity: 1 });
      }
      data.Item.total_price += 1;
      const updateParams = {
        TableName: "Orders",
        Key: { Order_ID: orderId },
        ReturnValues: "ALL_NEW",
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
      const secondData = await documentClient.update(updateParams).promise();
      responseBody = JSON.stringify(secondData);
      statusCode = 200;
    } else {
      throw "Order not found.";
    }
  } catch (err) {
    console.log(err);
    responseBody = JSON.stringify({
      Message: "Error",
      Error: err
    });
    statusCode = 500;
  }

  const response = {
    statusCode: statusCode,
    body: responseBody
  };

  return response;

};
