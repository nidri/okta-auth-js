#!/bin/bash

DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
source $DIR/setup.sh

# Monolith version to test against
export MONOLITH_BUILDVERSION=2022.10.1-begin-254-gaefef87dfc4e

create_dockolith_test_org () {
  # Start monolith
  create_log_group "Install/Start Monolith"
  source ./scripts/monolith/install-dockolith.sh
  source ./scripts/monolith/start-dockolith.sh
  finish_log_group $?

  # Create test org and save environment variables in "testenv"
  create_log_group "Create Test Org"
  # Add widget test host to /etc/hosts
  export TEST_ORG_SUBDOMAIN="authjs-test-1"
  echo "${DOCKER_HOST_CONTAINER_IP} ${TEST_ORG_SUBDOMAIN}.okta1.com" >> /etc/hosts
  source ./scripts/monolith/create-e2e-env.sh
  finish_log_group $?
}