# Locust.io
This folder contains everything regarding testing our microservices with [locust.io](https://locust.io/).

## Requirements for local installation
Python 3

## Installation
`pip install locustio`

## Running Single Locust in localhost
* `locust -f locustfile.py --host https://{restapi_id}.execute-api.{region}.amazonaws.com/{stage_name}`  
Example  
* `locust -f locustfile.py --host https://02kq0qfexc.execute-api.us-east-1.amazonaws.com/dev`  
Open browser for locustio UI
* `localhost:8089`

## Understanding Distributed Locust
Locust can be run in a distributed way on multiple machines. Firstly a master must be run.
After that a slave can be run in another machine. If run locally, all slaves default to 127.0.0.1
and no master host must be specified.  
Example in localhost:  
* `locust -f locustfile.py --slave --master-host=192.168.0.100 --host=http://example.com`

## Running Distributed Locust with Helm (Kubernetes + Docker) in Google Cloud
### Google Cloud Console Quickstart
Get gcloud and kubectl installed and set the project for gcloud
* https://cloud.google.com/kubernetes-engine/docs/quickstart  

After that you need to change quotas in Google Cloud Console:    
![Change quotas in Google Cloud Console](readme-images/change-quotas.png)  
After this you can deploy a cluster  
* `gcloud container clusters create --machine-type n1-standard-2 locust-cluster --zone europe-west4`
You should end up something like:
```
NAME            LOCATION      MASTER_VERSION  MASTER_IP      MACHINE_TYPE   NODE_VERSION   NUM_NODES  STATUS
locust-cluster  europe-west4  1.12.7-gke.10   34.90.190.240  n1-standard-2  1.12.7-gke.10  9          RUNNING
```
### Helm Deployment
* Change locust slave count (`replicaCount`) and `target-host` in `helm/values.yaml`  
* Change locustfile under `helm/tasks/tasks.py`  
`cd helm`  
`helm install --name helm-locust -f values.yaml ./`  
Find the master pod and forward it  
`kubectl get pods`  
`kubectl port-forward <master-pod-name> 8089`    
Access external swarm via local url:  
[http://127.0.0.1:8089/](http://127.0.0.1:8089/)

## Removing 
`helm del --purge helm-locust`

## Debug kubectl pods
* `kubectl get pods`
* `kubectl describe pods ${pod-name}`
* `kubectl -n default logs -p ${pod-name}`

## Additional Documentation on The Chart  
* https://github.com/helm/charts/tree/master/stable/locust

<!--
## Docker
From the locustio directory, build a docker image via:
```docker build -t locust:locust_container .```  
You can then verify that the docker file has been built successfully by running:  
```
docker run -it \  
       -e TARGET_HOST=http://<insert_target_host> \
       -e LOCUST_TASK=locust/locustfile.py \
       -p 8089:8089 locust:locust_container
```  
Example:  
* `sudo docker run -it -e TARGET_HOST=https://6ull6qibde.execute-api.us-east-1.amazonaws.com/dev -e LOCUST_TASK=/locust/locustfile.py -p 8089:8089 locust:locust_container`
# GCE deployment
Next, assuming you have kubernetes and gcloud installed, you can push the docker image to google via:
`gcloud components install docker-credential-gcr`
`gcloud docker -- build -t  gcr.io/${project-id}/${docker_image_name}:${tag}  --file=Dockerfile  . && gcloud docker -- push gcr.io/${project-id}/${docker_image_name}:${tag}`  
Example  
```
gcloud docker -- build -t  gcr.io/web-data-management-242011/locust:locust_container  --file=Dockerfile  . && gcloud docker -- push gcr.io/web-data-management-242011/locust:locust_container
```  
(Handy [YouTube video](https://www.youtube.com/watch?v=pn0cPqUusRE&feature=youtu.be))
-->