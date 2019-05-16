# IN4331-Web-Data-Management
Microservices using AWS Lambda, API Gateway and Lambda.
## Deployment

To deploy this example to an AWS environment, run:

`./build.sh deploy <stage> <region> <aws_profile>`

which will install NPM packages and use the `Serverless` framework to deploy both
DynamoDB tables as well as Lambda functions to the account.

To remove the demo, run:

`./build.sh remove <stage> <region> <aws_profile>`