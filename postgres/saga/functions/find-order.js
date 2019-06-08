console.log('Starting to find order');

const AWS = require('aws-sdk');
const region = process.env.AWS_REGION;
const lambda = new AWS.Lambda();

exports.handler = async function (e, ctx) {

    try {
        const orderId = ((e.pathParameters || {})['order_id']) || e.order_id;

        const findOrder = {
            FunctionName: "orders-microservice-dev-find-order",
            InvocationType: "RequestResponse",
            Payload: JSON.stringify({
                "order_id": orderId,
            })
        };

        const findOrderResult = await lambda.invoke(findOrder).promise().then(res => res.Payload);
        if (JSON.parse(findOrderResult).statusCode !== 200) {
            throw "Couldn't find order in order table."
        }

        const order = JSON.parse(findOrderResult);

        const getPaymentStatus = {
            FunctionName: "payment-microservice-dev-payment-status",
            InvocationType: "RequestResponse",
            Payload: JSON.stringify({
                "order_id": orderId,
            })
        };

        const result = JSON.parse(order.body);

        const getPaymentStatusResult = await lambda.invoke(getPaymentStatus).promise().then(res => res.Payload);
        if (JSON.parse(getPaymentStatusResult).statusCode !== 200 && JSON.parse(getPaymentStatusResult).statusCode !== 404) {
            throw "Something went wrong when retrieving the payment."
        }

        const payment = JSON.parse(getPaymentStatusResult);

        if (payment.statusCode === 404) {
            payment.ispaid = false;
        } else {
            payment.ispaid = JSON.parse(payment.body).Data.Item.ispaid;
        }

        return {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(result),
            isBase64Encoded: false,
        }

    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({Message: err}),
            isBase64Encoded: false,
        }
    }
};
