console.log('Starting order checkout saga');

const AWS = require('aws-sdk');
const region = process.env.AWS_REGION;
const lambda = new AWS.Lambda();

const rollbackFromNoStock = async (subtractedItems, user_id, credit) => {
  for (let i = 0; i < subtractedItems.length; i++) {
    const addItem = {
      FunctionName: "postgres-stock-microservice-dev-stock-add",
      InvocationType: "RequestResponse",
      Payload: JSON.stringify({
        "item_id": subtractedItems.item_id,
        "number": subtractedItems.quantity
      })
    }

    const addItemResult = await lambda.invoke(addItem).promise().then(res => res.Payload);
    if (JSON.parse(addItemResult).statusCode !== 200) {
      throw "Unable to restock items from order, manual fix necessary."
    }
  }

  const addCredit = {
    FunctionName: "postgres-users-microservice-dev-credit-add",
    InvocationType: "RequestResponse",
    Payload: JSON.stringify({
      "user_id": user_id,
      "amount": credit
    })
  }

  const addCreditResult = await lambda.invoke(addCredit).promise().then(res => res.Payload);
  if (JSON.parse(addCreditResult).statusCode !== 200) {
    throw "Unable to refund credit to user account, manual fix necessary."
  }

  return {
    statusCode: 412,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Message: "No STOCK or unable to set pay to true!" }),
    isBase64Encoded: false,
  }
}

exports.handler = async function(e, ctx) {

    try {
        const orderId = ((e.pathParameters || {})['order_id']) || e.order_id;

        const findOrder = {
          FunctionName: "postgres-orders-microservice-dev-find-order",
          InvocationType: "RequestResponse",
          Payload: JSON.stringify({
            "order_id": orderId,
          })
        }

        const findOrderResult = await lambda.invoke(findOrder).promise().then(res => res.Payload);
        if (JSON.parse(findOrderResult).statusCode !== 200) {
          throw "Couldn't find order in order table."
        }
        const order = JSON.parse(findOrderResult);

        const getPaymentStatus = {
          FunctionName: "postgres-payment-microservice-dev-payment-status",
          InvocationType: "RequestResponse",
          Payload: JSON.stringify({
            "order_id": orderId,
          })
        }

        const getPaymentStatusResult = await lambda.invoke(getPaymentStatus).promise().then(res => res.Payload);
        if (JSON.parse(getPaymentStatusResult).statusCode === 200 &&
            JSON.parse(JSON.parse(getPaymentStatusResult).body).Data.Item.isPaid === true) {
              throw "Order is already paid."
        }

        const subtractCredit = {
          FunctionName: "postgres-users-microservice-dev-credit-subtract",
          InvocationType: "RequestResponse",
          Payload: JSON.stringify({
            "user_id": JSON.parse(order.body).Item.user_id,
            "amount": JSON.parse(order.body).Item.total_price
          })
        }

        const subtractCreditResult = await lambda.invoke(subtractCredit).promise().then(res => res.Payload);
        if (JSON.parse(subtractCreditResult).statusCode !== 200) {
          throw "User does not have enough credits."
        }

        let subtractedItems = [];

        for (let i = 0; i < JSON.parse(order.body).Item.items.length; i++) {
          const subtractItem = {
            FunctionName: "postgres-stock-microservice-dev-stock-subtract",
            InvocationType: "RequestResponse",
            Payload: JSON.stringify({
              "item_id": JSON.parse(order.body).Item.items[i].item_id,
              "number": JSON.parse(order.body).Item.items[i].quantity
            })
          }
          const subtractItemResult = await lambda.invoke(subtractItem).promise().then(res => res.Payload);
          if (JSON.parse(subtractItemResult).statusCode !== 200) {
            return await rollbackFromNoStock(subtractedItems, JSON.parse(order.body).Item.user_id, JSON.parse(order.body).Item.total_price)
          }
          subtractedItems.push({
            "item_id": JSON.parse(order.body).Item.items[i].item_id,
            "quantity": JSON.parse(order.body).Item.items[i].quantity
          })
        }

        const setPaymentStatus = {
          FunctionName: "postgres-payment-microservice-dev-pay",
          InvocationType: "RequestResponse",
          Payload: JSON.stringify({
            "order_id": orderId,
            "user_id": JSON.parse(order.body).Item.user_id,
          })
        }

        const setPaymentStatusResult = await lambda.invoke(setPaymentStatus).promise().then(res => res.Payload);
        if (JSON.parse(setPaymentStatusResult).statusCode !== 200){
          return await rollbackFromNoStock(subtractedItems, JSON.parse(order.body).Item.user_id, JSON.parse(order.body).Item.total_price)
        }

        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Message: "Good for now" }),
          isBase64Encoded: false,
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
