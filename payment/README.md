# Payment Service
Microservice using AWS Lambda and API Gateway.
## Setting AWS Credentials  
https://www.youtube.com/watch?v=KngM5bfpttA  

## Install Serverless Globally
Use node
* `npm install serverless -g`
## Deployment of Microservice

To deploy the microservices to an AWS environment, run:  
* `npm install`

* `./build.sh deploy <stage> <region> <aws_profile>`
  
example:  
    
`./build.sh deploy dev us-east-1 default`

which will install NPM packages and use the `Serverless` framework to deploy both
DynamoDB tables as well as Lambda functions to the account.

## (Re)deploying Single AWS Function  
To save time and re-deploy only a single function after modifications, use:  
* `serverless deploy function -f <function> -s <stage> -r <region>`
Example
* `serverless deploy function -f pay -s dev -r us-east-1`

## Removal of Microservice
To remove the micro services, run:

* `./build.sh remove <stage> <region> <aws_profile>`

example:  

`./build.sh remove dev us-east-1 default`