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

  const uuid = uuidv4();
  const user_id = ((event.pathParameters || {})["user_id"]) || event.user_id;
  // const findUserStatusCode = ((event.FindUserResult.statusCode)) || 404;

  // if (findUserStatusCode !== 200) {
  //   return {
  //     statusCode: 404,
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       Message: "User not found"
  //     })
  //   }
  // }

  const searchParams = {
    TableName: "Orders",
    Key: {
      Order_ID: uuid
    }
  };

  try {
    const data = await documentClient.get(searchParams).promise();
    if (data.Item) {
      throw "Duplicate ID tried to be written.";
    } else {
      const putParams = {
        TableName: "Orders",
        Item: {
          Order_ID: uuid,
          User_ID: user_id,
          items: [],
          total_price: 0
        }
      };
      const data = await documentClient.put(putParams).promise();
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Order_ID: uuid
        }),
        isBase64Encoded: false
      };
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
