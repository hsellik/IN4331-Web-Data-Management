'use strict'

const AWS = require('aws-sdk')
const lambda = new AWS.Lambda();

module.exports.handler = async function(e, ctx) {
  const user_id = ((e.pathParameters || {})['user_id']) || e.user_id;
  
  const findUser = {
    FunctionName: "users-microservice-dev-find-user", 
    InvocationType: "RequestResponse", 
    Payload: JSON.stringify({"user_id": user_id})
  }

  const createOrder = {
    FunctionName: "orders-microservice-dev-create-order", 
    InvocationType: "RequestResponse", 
    Payload: JSON.stringify({"user_id": user_id})
  }

  try {
    const findUserResult = await lambda.invoke(findUser).promise().then(res => res.Payload);

    if(JSON.parse(findUserResult).statusCode == 200) {
      const createOrderResult = await lambda.invoke(createOrder).promise().then(res => res.Payload);
      return JSON.parse(createOrderResult);
    } else {
      return {
        statusCode: 404,
        headers: { 
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ Message: "User not found, could not create order." }),
        isBase64Encoded: false,
      };
    }
  } catch (err) {
    return {
        statusCode: 501,
        headers: { 
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          Message: err,
          Body: "Failed to create an order." 
        }),
        isBase64Encoded: false,
    };
  }
}