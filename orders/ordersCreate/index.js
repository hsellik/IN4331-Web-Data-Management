'use strict';
const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

AWS.config.update({ region: "us-east-1"});

exports.handler = async (event, context) => {
  const ddb = new AWS.DynamoDB({ apiVersion: "2012-10-08"});
  const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1"});

  const uuid = uuidv4();
  // TODO: add user from url
  const user_id = 1;

  const searchParams = {
    TableName: "orders",
    Key: {
      id: uuid
    }
  };

  const putParams = {
    TableName: "orders",
    Item: {
      id: uuid,
      user_id: user_id,
      paid: false
    }
  };

  try {
    // Check if UUID already exists
    const data = await documentClient.get(searchParams).promise();
    if (data.length > 0) {
      console.log('Duplicate ID tried to be written.')
      // TODO: Call this function again? Return error?
    } else {
      // Add order to table
      const data = await documentClient.put(putParams).promise();
      return uuid;
    }  
  } catch (err) {
    console.log(err)
  }

};
