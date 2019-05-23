#!/usr/bin/env bash

set -e

usage()
{
  echo ""
  echo ""
  echo "To deploy, run ./build-all.sh deploy <stage> <region> <aws_profile>"
  echo "To remove, run ./build-all.sh remove <stage> <region> <aws_profile>"
  echo ""
  echo "aws_profile: name of local AWS profile, to set one up run 'aws configure --profile profile_name'"
  echo ""
  echo "eg. ./build.sh deploy dev us-east-1 personal"
}

if [ $# -eq 0 ]; then
  usage
  exit 1
elif [ "$1" = "deploy" ] && [ $# -eq 4 ]; then
  STAGE=$2
  REGION=$3
  PROFILE=$4

  for service in $(find . -maxdepth 2 -type f -name serverless.yml -exec dirname {} \;)
  do
    echo '------------- ADDING $service SERIVCE -------------'
    cd $service
    ./build.sh deploy $STAGE $REGION $PROFILE
    cd -
  done
elif [ "$1" = "remove" ] && [ $# -eq 4 ]; then
  STAGE=$2
  REGION=$3
  PROFILE=$4

  for service in $(find . -maxdepth 2 -type f -name serverless.yml -exec dirname {} \;)
  do
    echo '------------- REMOVING $service SERIVCE -------------'
    cd $service
    ./build.sh remove $STAGE $REGION $PROFILE
    cd -
  done

  AWS_PROFILE=$PROFILE "node_modules/.bin/sls" remove -s $STAGE -r $REGION
else
  usage
  exit 1
fi