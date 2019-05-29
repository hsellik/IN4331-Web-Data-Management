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
## Running (in `postgresql` folder)
* `./build-all.sh deploy <stage> <region> <aws_profile>`  
Example  
* `./build-all.sh deploy dev us-east-1 default`
## Removing (in `postgresql` folder)
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
## DB connection and return data
As the parameters of the DB server is passed into Node.js environment through `serverless.yml`, you could connect to the database like:
```
const { Pool, Client } = require('pg');
const pool = new Pool({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        database: process.env.PGDATABASE,
        password: process.env.PGPASSWORD,
        port: process.env.PGPORT,
    });
``` 
For returning the data, we only need the `rows` of the data:
```
JSON.stringify(data.rows)
```
## TODO
* Complete `CREATE_TABLE` for other microservices. **Done.**
* Test the deployment script for other microservices. **Stock and orders tested**
* Migrate DynamoDB to PostGreSql and test the functionalities. **On progress** 