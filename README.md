# IN4331-Web-Data-Management
Microservices using AWS Lambda, API Gateway and Lambda.
## Setting AWS Credentials  
https://www.youtube.com/watch?v=KngM5bfpttA  
## Deployment


To deploy the microservices to an AWS environment, run:  
* `npm install`

* `./build.sh deploy <stage> <region> <aws_profile>`
  
example:  
    
`./build.sh deploy dev us-east-1 default`

which will install NPM packages and use the `Serverless` framework to deploy both
DynamoDB tables as well as Lambda functions to the account.

To remove the micro services, run:

* `./build.sh remove <stage> <region> <aws_profile>`

example:  

`./build.sh remove dev us-east-1 default`

## Saga Documentations
- You have a `StartAt`, which refers to a state.
- The types that we are using now, are `Task` and `Fail`.
    - `Task` is for a normal task.
    - `Fail` is an an error task.
- The `Resource` refers to the action to do, so a lambda function or a saga endpoint.
    - It requires a `arn://` format.
- The `Catch` attribute is for catching errors.
    - Now all errors are caught by the same action.
    - More can be read [here](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-mode-exceptions.html)
- The `ResultPath` attribute is used to add the result of the task to a key in the input json.
- The `OutputPath` attribute is used to define the output of the task. In other words, it defines the input for the next task.
- More about the paths can be read [here](https://docs.aws.amazon.com/step-functions/latest/dg/input-output-example.html).
- `Next` is used for defining the next task to execute.
- If there is no next task to execute, you have to set the attribute `End` to `true`.
- You can test the json file [here](https://console.aws.amazon.com/states/home?region=us-east-1#/statemachines)

## To do:
- Replace Saga resource routes/ endpoints by correct ones
- Add support for saga parameters in the functions, see `payment-status.js`.
- Improve error handling instead of States.ALL
    - <https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-mode-exceptions.html>
- Add stock for all items, replacing for loop
- Subtract stock for all items given, replacing for loop
