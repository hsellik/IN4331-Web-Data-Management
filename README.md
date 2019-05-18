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

## To do:
- Replace Saga resource routes/ endpoints by correct ones
- Improve error handling instead of States.ALL
    - https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-mode-exceptions.html
- Add stock for all items, replacing for loop
- Subtract stock for all items given, replacing for loop
