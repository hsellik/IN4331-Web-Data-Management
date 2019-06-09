console.log('Starting order remove saga');

const AWS = require('aws-sdk');
const region = process.env.AWS_REGION;
const lambda = new AWS.Lambda();

exports.handler = async function(e, ctx) {

    const orderId = ((e.pathParameters || {})['order_id']) || e.order_id;

    const paymentStatus = {
        FunctionName: "postgres-payment-microservice-dev-payment-status",
        InvocationType: "RequestResponse", 
        Payload: JSON.stringify({"order_id": orderId})
    };

    const removeOrder = {
        FunctionName: "postgres-orders-microservice-dev-remove-order",
        InvocationType: "RequestResponse", 
        Payload: JSON.stringify({"order_id": orderId})
    };

    const removePayment = {
        FunctionName: "postgres-payment-microservice-dev-remove-payment",
        InvocationType: "RequestResponse", 
        Payload: JSON.stringify({"order_id": orderId})
    }
    
    const findOrder = {
        FunctionName: "postgres-orders-microservice-dev-find-order",
        InvocationType: "RequestResponse", 
        Payload: JSON.stringify({"order_id": orderId})
    }

    try {
        let paymentStatusResult = await lambda.invoke(paymentStatus).promise().then(res => res.Payload);
        paymentStatusResult = JSON.parse(paymentStatusResult);
        const paymentStatusResultBody = JSON.parse(paymentStatusResult.body);

        if ((paymentStatusResult.statusCode == 200 && paymentStatusResultBody.isPaid == false) || paymentStatusResult.statusCode == 404) {

            let findOrderResult = await lambda.invoke(findOrder).promise().then(res => res.Payload);
            findOrderResult = JSON.parse(findOrderResult);

            if (findOrderResult.statusCode == 404) {
                return {
                    statusCode: 404,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        Message: "Order not found",
                        FindOrderResult: findOrderResult
                    })
                }
            }

            let removeOrderResult = await lambda.invoke(removeOrder).promise().then(res => res.Payload);
            removeOrderResult = JSON.parse(removeOrderResult);

            if (removeOrderResult.statusCode != 200) {
                return {
                    statusCode: removeOrderResult.statusCode,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        "Message": "Order not found or internal error at the orders microservice" ,
                        "RemoveOrderResult":  removeOrderResult
                    }),
                    isBase64Encoded: false,
                };
            }

            if (paymentStatusResult.statusCode == 404) {
                return {
                    statusCode: 200,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        Message: "Order successfuly removed and it did not have a payment yet"
                    })
                }
            } else {
                let removePaymentResult = await lambda.invoke(removePayment).promise().then(res => res.Payload);
                removePaymentResult = JSON.parse(removePaymentResult);

                if (removePaymentResult.statusCode == 200) {
                    return {
                        statusCode: 200,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            "Message": "Order was not paid yet, order and its unpaid payment were successfuly removed",
                        })
                    };
                } else {
                    return {
                        statusCode: removePaymentResult.statusCode,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            "Message": "Successfuly removed order but failed to remove its payment",
                            "RemovePaymentResult": removePaymentResult
                        })
                    }
                }
            }
        } else if (paymentStatusResult.statusCode == 200) {
            return {
                statusCode: 404,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    "Message": "The order is already paid, will not remove it and its payment" 
                }),
                isBase64Encoded: false,
            };
        } else {
            return {
                statusCode: paymentStatusResult.statusCode,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    "Message": "Internal error at the payment microservice" ,
                    "PaymentStatusResult":  paymentStatusResult
                }),
                isBase64Encoded: false,
            };
        }

    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                Message: err
            })
        }
    }
};
