console.log('Starting order create saga');

const AWS = require('aws-sdk');
const region = process.env.AWS_REGION;
const stepFunctionClient = new AWS.StepFunctions({region: region});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.handler = async function(e, ctx) {

    try {
        const AWSAccountId = e.requestContext.accountId;
        const userId = ((e.pathParameters || {})['user_id']) || e.user_id;

        const stepFunctionArn = `arn:aws:states:${region}:${AWSAccountId}:stateMachine:OrderCreateStateMachine`;
        const stepFunctionExecutionParams = {
            stateMachineArn: stepFunctionArn,
            input: JSON.stringify({
                user_id: userId,
            }),
        }
        
        const startExecutionResult = await stepFunctionClient.startExecution(stepFunctionExecutionParams).promise();
        const executionArn = startExecutionResult.executionArn;

        let result = { status: "RUNNING" };
        while (result.status === "RUNNING") {
          result = await stepFunctionClient.describeExecution({ executionArn: executionArn }).promise();
          await sleep(600);
        }
  
        while (result.status === "SUCCEEDED" && (result.output === null || typeof result.output === 'undefined')) {
          result = await stepFunctionClient.describeExecution({ executionArn: executionArn }).promise();
          await sleep(600);
        }

        if (result.status === "SUCCEEDED") {
          resultJson = JSON.parse(result.output);
        };
        
        if (result.status === "SUCCEEDED" && resultJson.OrderCreateResult && resultJson.OrderCreateResult.body) {
            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  Order_ID: resultJson.OrderCreateResult.body,
                 }),
                isBase64Encoded: false,
            };
        } else {
            return {
                statusCode: 550,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result),
                isBase64Encoded: false,
            };
        }
    } catch (err) {
        console.log(err);
        return {
            statusCode: 555,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              Message: err 
            }),
            isBase64Encoded: false,
        }
    }
};
