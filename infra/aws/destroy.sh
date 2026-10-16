#!/usr/bin/env bash
# Elimina todo lo creado por deploy.sh (instancia, CloudFront, ECR con sus imagenes).
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
STACK="${STACK_NAME:-codesa-shop}"

aws --region "$REGION" cloudformation delete-stack --stack-name "$STACK"
aws --region "$REGION" cloudformation wait stack-delete-complete --stack-name "$STACK"
echo "Stack $STACK eliminado"
