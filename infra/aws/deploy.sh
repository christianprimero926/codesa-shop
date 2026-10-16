#!/usr/bin/env bash
# Despliega Codesa Shop en AWS: crea/actualiza la infraestructura, publica las imagenes en ECR
# y reinicia los contenedores en la instancia por SSM.
# Uso: AWS_REGION=us-east-1 ./infra/aws/deploy.sh
set -euo pipefail

REGION="${AWS_REGION:-us-east-1}"
STACK="${STACK_NAME:-codesa-shop}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TAG="$(date +%Y%m%d%H%M)"

aws_cli() {
  aws --region "$REGION" "$@"
}

output() {
  aws_cli cloudformation describe-stacks --stack-name "$STACK" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text
}

echo "==> Infraestructura ($STACK en $REGION)"
PARAMS=()
if ! aws_cli cloudformation describe-stacks --stack-name "$STACK" >/dev/null 2>&1; then
  PREFIX_LIST="$(aws_cli ec2 describe-managed-prefix-lists \
    --filters Name=prefix-list-name,Values=com.amazonaws.global.cloudfront.origin-facing \
    --query 'PrefixLists[0].PrefixListId' --output text)"
  PARAMS=(--parameter-overrides "CloudFrontPrefixListId=$PREFIX_LIST" "DbPassword=$(openssl rand -hex 16)")
fi
aws_cli cloudformation deploy \
  --stack-name "$STACK" \
  --template-file "$ROOT/infra/aws/codesa-shop.yml" \
  --capabilities CAPABILITY_IAM \
  "${PARAMS[@]}"

BACKEND_REPO="$(output BackendRepositoryUri)"
FRONTEND_REPO="$(output FrontendRepositoryUri)"
INSTANCE_ID="$(output InstanceId)"
SHOP_URL="$(output ShopUrl)"

echo "==> Imagenes ($TAG)"
aws_cli ecr get-login-password | docker login --username AWS --password-stdin "${BACKEND_REPO%%/*}"
docker build -t "$BACKEND_REPO:$TAG" "$ROOT/backend"
docker build --build-arg BUILD_CONFIGURATION=aws -t "$FRONTEND_REPO:$TAG" "$ROOT/frontend"
docker push "$BACKEND_REPO:$TAG"
docker push "$FRONTEND_REPO:$TAG"

echo "==> Esperando a que la instancia este lista"
until [ "$(aws_cli ssm describe-instance-information \
  --filters "Key=InstanceIds,Values=$INSTANCE_ID" \
  --query 'InstanceInformationList[0].PingStatus' --output text)" = "Online" ]; do
  sleep 10
done

echo "==> Desplegando en la instancia"
COMMAND_ID="$(aws_cli ssm send-command \
  --instance-ids "$INSTANCE_ID" \
  --document-name AWS-RunShellScript \
  --parameters "commands=[\"cloud-init status --wait\",\"/opt/codesa/deploy.sh $TAG\"]" \
  --query 'Command.CommandId' --output text)"
aws_cli ssm wait command-executed --command-id "$COMMAND_ID" --instance-id "$INSTANCE_ID" || true
aws_cli ssm get-command-invocation --command-id "$COMMAND_ID" --instance-id "$INSTANCE_ID" \
  --query '[Status,StandardOutputContent,StandardErrorContent]' --output text

echo
echo "Tienda publicada en: $SHOP_URL"
