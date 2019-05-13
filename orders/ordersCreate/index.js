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
    TableName: "orders",
    Key: {
      id: uuid
    }
  };

  try {
    const data = await documentClient.get(searchParams).promise();
    if (data.length > 0) {
      console.log('Duplicate ID tried to be written.')
      // TODO: Call this function again?
    } else {
      const putParams = {
        TableName: "orders",
        Item: {
          id: uuid,
          user_id: user_id,
          paid: false
        }
      };
      const data = await documentClient.put(putParams).promise();
      responseBody = uuid;
      statusCode = 200;
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
