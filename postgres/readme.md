# Web Data Management: Lambda Microservices
This repository contains 4 microservices:
* `user-service` (sub-directory `users/`)
* `stock-service` (sub-directory `stock/`)
* `payment-service` (sub-directory `payment/`)
* `order-service` (sub-directory `orders/`)
  
Each microservice can be run seperately using `build.sh` scripts under the respective directories of microservices.
Alternatively you can deploy all services at once by using the `build-all.sh` script in the 
project root directory (see below).
## Requirements
* AWS CLI access (pip3 install awscli --upgrade --user)
* Node
* psql (brew install psql)
## Running
* `./build-all.sh deploy <stage> <region> <aws_profile>`  
Example  
* `./build-all.sh deploy dev us-east-1 default`
## Removing
* `./build-all.sh remove <stage> <region> <aws_profile>`  
Example  
* `./build-all.sh remove dev us-east-1 default`
## Configuration
* Config database settings in `db.config` under each microservice directory.
  * `DB_IDENTIFIER`
  * `PGPORT`
  * `PGDATABASE`
  * `PGUSER=master`
  * `PGPASSWORD`
  * `TABLE_NAME`
  * `CREATE_TABLE`