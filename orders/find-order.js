'use strict';
const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

AWS.config.update({ region: "us-east-1"});

exports.handler = async (event, context) => {
  const ddb = new AWS.DynamoDB({ apiVersion: "2012-10-08"});
  const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1"});

  let responseBody = "";
  let statusCode = 0;

  const uuid = uuidv4();
  const { user_id } = event.pathParameters;

  const searchParams = {
    TableName: "Orders",
    Key: {
      id: uuid
    }
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
    console.log(err)
    responseBody = "Something went wrong."
    statusCode = 403;
  }
  
  const response = { 
    statusCode: statusCode,
    body: responseBody
  };
  
  return response;

};
