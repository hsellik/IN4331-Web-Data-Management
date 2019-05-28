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

  const searchParams = {
    TableName: "Orders",
    Key: {
      Order_ID: order_id
    }
  };

  const selectQuery = {
    text: 'SELECT * FROM Orders JOIN OrderRow ON Orders.order_id = OrderRow.order_id WHERE Orders.order_id = $1',
    values: [order_id],
  };

  try {
    const data = await documentClient.get(searchParams).promise();
    if (data.Item) {
      statusCode = 200;
      responseBody = JSON.stringify(data);
    } else {
      throw 'Could not find ID.';
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
