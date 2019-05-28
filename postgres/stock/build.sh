#!/usr/bin/env bash

set -e

usage()
{
  echo ""
  echo ""
  echo "To deploy, run ./build.sh deploy <stage> <region> <aws_profile>"
  echo "To remove, run ./build.sh remove <stage> <region> <aws_profile>"
  echo ""
  echo "aws_profile: name of local AWS profile, to set one up run 'aws configure --profile profile_name'"
  echo ""
  echo "eg. ./build.sh deploy dev us-east-1 personal"
}

# get configuration of database
source db.config

# replace placeholder
replace()
{
  sed -i '.backup' "s/PLACEHOLDER-DBID/$DB_IDENTIFIER/g" *.yml
  sed -i '.backup' "s/PLACEHOLDER-DBNAME/$PGDATABASE/g" *.yml
  sed -i '.backup' "s/PLACEHOLDER-USERNAME/$PGUSER/g" *.yml
  sed -i '.backup' "s/PLACEHOLDER-PWD/$PGPASSWORD/g" *.yml
  sed -i '.backup' "s/PLACEHOLDER-DBINSTANCE-CLASS/$DBINSTANCE_CLASS/g" *.yml
}

# restore placeholder
restore()
{
  sed -i '.backup' "s/$DBINSTANCE_CLASS/PLACEHOLDER-DBINSTANCE-CLASS/g" *.yml
  sed -i '.backup' "s/$PGPASSWORD/PLACEHOLDER-PWD/g" *.yml
  sed -i '.backup' "s/$PGUSER/PLACEHOLDER-USERNAME/g" *.yml
  sed -i '.backup' "s/$PGDATABASE/PLACEHOLDER-DBNAME/g" *.yml
  sed -i '.backup' "s/$DB_IDENTIFIER/PLACEHOLDER-DBID/g" *.yml
  rm *.backup
}

if [ $# -eq 0 ]; then
  usage
  exit 1
elif [ "$1" = "deploy" ] && [ $# -eq 4 ]; then
  STAGE=$2
  REGION=$3
  PROFILE=$4

  replace

  npm install

  AWS_PROFILE=$PROFILE "node_modules/.bin/sls" deploy -s $STAGE -r $REGION

  # get endpoint by db instance identifier
  PGHOST=$(aws rds describe-db-instances \
      --query 'DBInstances[*].Endpoint.Address' \
      --filters Name=db-instance-id,Values=$DB_IDENTIFIER \
      --output text \
      )

  if [ -z $PGHOST ]
  then
      echo "Instance $DB_IDENTIFIER does not exist!"
  else
      echo "Instance $DB_IDENTIFIER exists!"

      # if the env PGHOST is not set which means it's the first deployment,
      # then we have to redeploy it to let lambda function get the database env variable
      if ! grep -q $PGHOST "serverless.yml"; then
        sed -i '.backup' "s/PLACEHOLDER_PGHOST/$PGHOST/g" *.yml
        AWS_PROFILE=$PROFILE "node_modules/.bin/sls" deploy -s $STAGE -r $REGION
      fi

      # create table, table name and column name are case insensitive
      PGHOST=$PGHOST PGPORT=$PGPORT PGDATABASE=$PGDATABASE PGUSER=$PGUSER PGPASSWORD=$PGPASSWORD \
      psql -w -c "$CREATE_TABLE"
  fi

elif [ "$1" = "remove" ] && [ $# -eq 4 ]; then
  STAGE=$2
  REGION=$3
  PROFILE=$4

  replace
  
  # get endpoint before deleting the db instance
  PGHOST=$(aws rds describe-db-instances \
      --query 'DBInstances[*].Endpoint.Address' \
      --filters Name=db-instance-id,Values=$DB_IDENTIFIER \
      --output text \
      )

  npm install

  echo "Start remove deployment"
  AWS_PROFILE=$PROFILE "node_modules/.bin/sls" remove -s $STAGE -r $REGION

  # replace the env host in .yml with placeholder for next deployment
  if [ -z $PGHOST ]
  then
      echo "Instance $DB_IDENTIFIER does not exist!"
  else∂
      # if the env PGHOST is set which means it's not the first deployment,
      # then we have to replace db env variable to with placeholder for next deployment
      if grep -q $PGHOST "serverless.yml"; then
        sed -i '.backup' "s/$PGHOST/PLACEHOLDER_PGHOST/g" *.yml
      fi
  fi
else
  usage
  exit 1
fi

restore