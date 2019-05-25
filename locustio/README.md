# Locust.io
This folder contains everything regarding testing our microservices with [locust.io](https://locust.io/).

## Requirements
Python 3

## Installation
`pip install locustio`

## Running
* `locust -f locustfile.py --host https://{restapi_id}.execute-api.{region}.amazonaws.com/{stage_name}`  
Example  
* `locust -f locustfile.py --host https://02kq0qfexc.execute-api.us-east-1.amazonaws.com/dev`  
Open browser for locustio UI
* `localhost:8089`

## Running Locust Slave
Locust can be run in a distributed way on multiple machines. Firstly a master must be run.
After that a slave can be run in another machine. If run locally, all slaves default to 127.0.0.1
and no master host must be specified.
* `locust -f locustfile.py --slave --master-host=192.168.0.100 --host=http://example.com`