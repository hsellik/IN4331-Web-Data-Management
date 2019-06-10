# Web Data Management: Lambda Microservices with Postgresql
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
## Running (in `postgres` folder)
* `./build-all.sh deploy <stage> <region> <aws_profile>`  
Example  
* `./build-all.sh deploy dev us-east-1 default`
## Removing (in `postgres` folder)
* `./build-all.sh remove <stage> <region> <aws_profile>`  
Example  
* `./build-all.sh remove dev us-east-1 default`
## Configuration
* Config database settings in `db.config` under each microservice directory.
  * `DB_IDENTIFIER` (a unique DB instance ID)
  * `PGPORT`
  * `PGDATABASE`
  * `PGUSER`
  * `PGPASSWORD`
  * `TABLE_NAME`
  * `DBINSTANCE_CLASS` (EC2 machine configuration)
  * `CREATE_TABLE` (not completely implemented, table only for stock functions are done)
## Settings not to change
* PLACEHOLDERs in `serverless.yml`.
* Parameters in `db.config`. Only change `CREATE_TABLE` if the table is not perfect.
