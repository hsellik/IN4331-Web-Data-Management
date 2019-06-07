console.log('Starting order add item saga');

const AWS = require('aws-sdk');
const region = process.env.AWS_REGION;
const lambda = new AWS.Lambda();

exports.handler = async function(e, ctx) {

    try {
        const orderId = ((e.pathParameters || {})['order_id']) || e.order_id;
        const itemId = ((e.pathParameters || {})['item_id']) || e.item_id;

        const checkAvailability = {
          FunctionName: "stock-microservice-dev-stock-availability", 
          InvocationType: "RequestResponse", 
          Payload: JSON.stringify({"item_id": itemId})
        }
      
        const addItemToOrder = {
          FunctionName: "orders-microservice-dev-add-item", 
          InvocationType: "RequestResponse", 
          Payload: JSON.stringify({
            "order_id": orderId,
            "item_id": itemId
          })
        }

        const checkAvailabilityResult = await lambda.invoke(checkAvailability).promise().then(res => res.Payload);

        if (JSON.parse(checkAvailabilityResult).statusCode == 200) {
            const body = JSON.parse(JSON.parse(checkAvailabilityResult).body);
            if (body.quantity !== null && body.quantity > 0) {
              const addItemToOrderResult = await lambda.invoke(addItemToOrder).promise().then(res => res.Payload);
              if (JSON.parse(addItemToOrderResult).statusCode == 200) {
                return {
                  statusCode: 200,
                  headers: { "Content-Type": "application/json" },
                  body: JSON.parse(addItemToOrderResult).body,
                  isBase64Encoded: false
                }
              } else {
                throw "Some error at order microservice."
              }
            } else {
              return {
                statusCode: 404,
                headers: { "Content-Type": "application/json" },
                body: { "Message": "Not enough items in stock" },
                isBase64Encoded: false,
              };
            }
        } else {
            return {
                statusCode: 404,
                headers: { "Content-Type": "application/json" },
                body: { "Message": "Item not found or internal error at stock microservice." },
                isBase64Encoded: false,
            };
        }
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Message: err }),
            isBase64Encoded: false,
        }
    }
};
