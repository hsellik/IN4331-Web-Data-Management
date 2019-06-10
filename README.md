# Web Data Management: Lambda Microservices with NodeJS, DynamoDB and Postgresql
## Structure :open_file_folder:
This repository contains 4 microservices:
* `user-service` (sub-directory `users/`)
* `stock-service` (sub-directory `stock/`)
* `payment-service` (sub-directory `payment/`)
* `order-service` (sub-directory `orders/`)  
#### Each microservice contains:  
* `functions/` which contain nodejs lambda functions
* `package.json` for installing serverless
* `serverless.yml` a yaml file which specifies link between API gateway and lambda functions.  
It also contains information about DynamoDB / Postgres tables. It is used by [Serverless framework](https://serverless.com/)
to deploy lambda functions to cloud.
* `build.sh` a script file which will run the serverless command  

Each microservice can be run seperately using `build.sh` scripts under the respective directories of microservices.
Alternatively you can deploy all services at once by using the `build-all.sh` script in the 
project root directory (see below).
## Endpoints 
Endpoints are described in  
https://docs.google.com/document/d/1gS8D2WqeKJ6wuohprigeW2cfVMlMn-6B1e_pFsEE3ZQ/edit  
The URL of endpoints will also be printed by the build scripts described below after deployment.
## Requirements
* AWS CLI access (pip3 install awscli --upgrade --user)
* Node
* psql (brew install psql)
* Serverless (npm install -g serverless)
## Setting AWS Credentials  
https://www.youtube.com/watch?v=KngM5bfpttA 
## Deploying NodeJS Lambda functions with DynamoDB :computer:
A shell script will deploy the whole project to AWS  
* `./build-all.sh deploy <stage> <region> <aws_profile>`  
Example  
* `./build-all.sh deploy dev us-east-1 default`
## Removing 
* `./build-all.sh remove <stage> <region> <aws_profile>`  
Example  
* `./build-all.sh remove dev us-east-1 default`
## Postgres Functions  
Use the same instructions for running and removing, but do them under `postgres` folder.

## Running and removing single service
Use the following commands under respective service folder  
#### Deploying  
`./build.sh deploy <stage> <region> <aws_profile>`
#### Removing
`./build.sh remove <stage> <region> <aws_profile>`

## (Re)deploying Single AWS Function  
To save time and re-deploy only a single function after modifications, use:  
* `serverless deploy function -f <function> -s <stage> -r <region>`
Example
* `serverless deploy function -f pay -s dev -r us-east-1`
  
## Load testing with locust.io  
`locustio` folder contains all the code necessary to deploy locust
in a master-slave configuration to a Kubernetes Cluster on 
Google Cloud Platform. See more in the README.md under `locustio`. 
