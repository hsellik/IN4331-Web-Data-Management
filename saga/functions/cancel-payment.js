console.log('Starting cancel payment saga');

const AWS = require('aws-sdk');
const region = process.env.AWS_REGION;
const stepFunctionClient = new AWS.StepFunctions({region: region});

exports.handler = async function(e, ctx) {

    try {
        const AWSAccountId = e.requestContext.accountId
        const userId = ((e.pathParameters || {})['user_id']) || e.user_id;
        const orderId = ((e.pathParameters || {})['order_id']) || e.order_id;

        const stepFunctionArn = `arn:aws:states:${region}:${AWSAccountId}:stateMachine:PaymentCancelStateMachine`;
        const stepFunctionExecutionParams = {
            stateMachineArn: stepFunctionArn,
            input: JSON.stringify({
                user_id: userId,
                order_id: orderId,
            }),
        }
        
        const startExecutionResult = await stepFunctionClient.startExecution(stepFunctionExecutionParams).promise();
        const executionArn = startExecutionResult.executionArn;

        let result = { status: "RUNNING" };
        while (result.status === "RUNNING") {
            result = await stepFunctionClient.describeExecution({ executionArn: executionArn }).promise();
        }

        if (result.status === "SUCCEEDED") {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result.output),
                isBase64Encoded: false,
            };
        } else {
            return {
                statusCode: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result),
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
