#!/bin/bash
set -e

AWS_ACCOUNT="062175121567"
AWS_REGION="eu-west-2"
ECR_REPO="paintbookco-segformer"
IMAGE_TAG="latest"
CLUSTER_NAME="paintbookco-ml"
SERVICE_NAME="segformer-service"
TASK_FAMILY="paintbookco-segformer"

echo "=== PaintBookCo SegFormer Deployment ==="
echo "Account: $AWS_ACCOUNT"
echo "Region: $AWS_REGION"

# Step 1: Create ECR repository if not exists
echo ""
echo "Step 1: Creating ECR repository..."
aws ecr describe-repositories --repository-names $ECR_REPO --region $AWS_REGION 2>/dev/null || \
aws ecr create-repository \
    --repository-name $ECR_REPO \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true

ECR_URI="$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO"

# Step 2: Build Docker image
echo ""
echo "Step 2: Building Docker image (this takes ~10-15 minutes first time)..."
docker build -t $ECR_REPO:$IMAGE_TAG .

# Step 3: Push to ECR
echo ""
echo "Step 3: Pushing to ECR..."
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $ECR_URI
docker tag $ECR_REPO:$IMAGE_TAG $ECR_URI:$IMAGE_TAG
docker push $ECR_URI:$IMAGE_TAG
echo "Image pushed: $ECR_URI:$IMAGE_TAG"

# Step 4: Create ECS cluster
echo ""
echo "Step 4: Creating ECS cluster..."
aws ecs create-cluster \
    --cluster-name $CLUSTER_NAME \
    --region $AWS_REGION \
    --capacity-providers FARGATE FARGATE_SPOT \
    --default-capacity-provider-strategy \
        capacityProvider=FARGATE_SPOT,weight=1 \
    2>/dev/null || echo "Cluster already exists"

# Step 5: Create task execution role if not exists
echo ""
echo "Step 5: Setting up IAM roles..."
aws iam create-role \
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "ecs-tasks.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }' 2>/dev/null || echo "Role already exists"

aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy \
    2>/dev/null || echo "Policy already attached"

# Step 6: Register task definition
echo ""
echo "Step 6: Registering ECS task definition..."
aws ecs register-task-definition \
    --region $AWS_REGION \
    --family $TASK_FAMILY \
    --network-mode awsvpc \
    --requires-compatibilities FARGATE \
    --cpu "2048" \
    --memory "8192" \
    --execution-role-arn "arn:aws:iam::${AWS_ACCOUNT}:role/ecsTaskExecutionRole" \
    --container-definitions "[
        {
            \"name\": \"segformer\",
            \"image\": \"${ECR_URI}:${IMAGE_TAG}\",
            \"portMappings\": [{
                \"containerPort\": 8080,
                \"protocol\": \"tcp\"
            }],
            \"logConfiguration\": {
                \"logDriver\": \"awslogs\",
                \"options\": {
                    \"awslogs-group\": \"/ecs/paintbookco-segformer\",
                    \"awslogs-region\": \"${AWS_REGION}\",
                    \"awslogs-stream-prefix\": \"ecs\",
                    \"awslogs-create-group\": \"true\"
                }
            },
            \"healthCheck\": {
                \"command\": [\"CMD-SHELL\", \"curl -f http://localhost:8080/health || exit 1\"],
                \"interval\": 30,
                \"timeout\": 5,
                \"retries\": 3,
                \"startPeriod\": 60
            }
        }
    ]"

# Step 7: Get default VPC and subnets
echo ""
echo "Step 7: Getting VPC configuration..."
VPC_ID=$(aws ec2 describe-vpcs \
    --region $AWS_REGION \
    --filters "Name=is-default,Values=true" \
    --query "Vpcs[0].VpcId" \
    --output text)
echo "VPC: $VPC_ID"

SUBNET_IDS=$(aws ec2 describe-subnets \
    --region $AWS_REGION \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query "Subnets[*].SubnetId" \
    --output json | python3 -c "import sys,json; print(','.join(json.load(sys.stdin)[:2]))")
echo "Subnets: $SUBNET_IDS"

# Step 8: Create security group
echo ""
echo "Step 8: Creating security group..."
SG_ID=$(aws ec2 create-security-group \
    --region $AWS_REGION \
    --group-name "paintbookco-segformer-sg" \
    --description "PaintBookCo SegFormer ECS security group" \
    --vpc-id $VPC_ID \
    --query "GroupId" \
    --output text 2>/dev/null) || \
SG_ID=$(aws ec2 describe-security-groups \
    --region $AWS_REGION \
    --filters "Name=group-name,Values=paintbookco-segformer-sg" \
    --query "SecurityGroups[0].GroupId" \
    --output text)
echo "Security Group: $SG_ID"

aws ec2 authorize-security-group-ingress \
    --region $AWS_REGION \
    --group-id $SG_ID \
    --protocol tcp \
    --port 8080 \
    --cidr 0.0.0.0/0 2>/dev/null || echo "Ingress rule already exists"

# Step 9: Create ECS service
echo ""
echo "Step 9: Creating ECS service..."
aws ecs create-service \
    --region $AWS_REGION \
    --cluster $CLUSTER_NAME \
    --service-name $SERVICE_NAME \
    --task-definition $TASK_FAMILY \
    --desired-count 0 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={
        subnets=[$SUBNET_IDS],
        securityGroups=[$SG_ID],
        assignPublicIp=ENABLED
    }" 2>/dev/null || echo "Service already exists"

# Step 10: Create API Gateway with Lambda for scale-to-zero
echo ""
echo "Step 10: Creating Lambda scale-to-zero orchestrator..."
cat > /tmp/lambda_handler.py << 'LAMBDA'
import boto3
import json
import time
import urllib.request
import urllib.error

ecs = boto3.client('ecs', region_name='eu-west-2')
ec2 = boto3.client('ec2', region_name='eu-west-2')

CLUSTER = 'paintbookco-ml'
SERVICE = 'segformer-service'
TASK_FAMILY = 'paintbookco-segformer'

def get_running_task_ip():
    tasks = ecs.list_tasks(cluster=CLUSTER, serviceName=SERVICE, desiredStatus='RUNNING')
    if not tasks['taskArns']:
        return None
    task_details = ecs.describe_tasks(cluster=CLUSTER, tasks=tasks['taskArns'])
    for task in task_details['tasks']:
        if task['lastStatus'] == 'RUNNING':
            for attachment in task.get('attachments', []):
                for detail in attachment.get('details', []):
                    if detail['name'] == 'networkInterfaceId':
                        eni = ec2.describe_network_interfaces(
                            NetworkInterfaceIds=[detail['value']]
                        )
                        return eni['NetworkInterfaces'][0]['Association']['PublicIp']
    return None

def wait_for_task(max_wait=120):
    for i in range(max_wait // 5):
        ip = get_running_task_ip()
        if ip:
            return ip
        print(f"Waiting for task... {i*5}s")
        time.sleep(5)
    return None

def handler(event, context):
    # Check if task is running
    ip = get_running_task_ip()

    if not ip:
        print("No running task — starting ECS service")
        ecs.update_service(cluster=CLUSTER, service=SERVICE, desiredCount=1)
        ip = wait_for_task(120)
        if not ip:
            return {
                'statusCode': 503,
                'body': json.dumps({'error': 'Service starting, please retry in 30 seconds'})
            }
        # Give Flask time to start
        time.sleep(10)

    # Forward request to ECS task
    body = event.get('body', '{}')
    if event.get('isBase64Encoded'):
        import base64
        body = base64.b64decode(body).decode('utf-8')

    url = f'http://{ip}:8080/segment'
    req = urllib.request.Request(
        url,
        data=body.encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            result = response.read().decode('utf-8')
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': result
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
LAMBDA

# Zip and deploy Lambda
cd /tmp
zip lambda_handler.zip lambda_handler.py

# Create Lambda execution role
aws iam create-role \
    --role-name paintbookco-segformer-lambda \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "lambda.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }' --region $AWS_REGION 2>/dev/null || echo "Lambda role exists"

aws iam attach-role-policy \
    --role-name paintbookco-segformer-lambda \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
    2>/dev/null

aws iam put-role-policy \
    --role-name paintbookco-segformer-lambda \
    --policy-name ecs-access \
    --policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": ["ecs:*", "ec2:DescribeNetworkInterfaces"],
            "Resource": "*"
        }]
    }'

sleep 10

# Deploy Lambda function
aws lambda create-function \
    --function-name paintbookco-segformer \
    --runtime python3.11 \
    --role "arn:aws:iam::${AWS_ACCOUNT}:role/paintbookco-segformer-lambda" \
    --handler lambda_handler.handler \
    --zip-file fileb:///tmp/lambda_handler.zip \
    --timeout 180 \
    --memory-size 256 \
    --region $AWS_REGION 2>/dev/null || \
aws lambda update-function-code \
    --function-name paintbookco-segformer \
    --zip-file fileb:///tmp/lambda_handler.zip \
    --region $AWS_REGION

# Step 11: Create API Gateway
echo ""
echo "Step 11: Creating API Gateway..."
API_ID=$(aws apigatewayv2 create-api \
    --name "paintbookco-segformer" \
    --protocol-type HTTP \
    --cors-configuration AllowOrigins='["*"]',AllowMethods='["POST","OPTIONS"]',AllowHeaders='["*"]' \
    --region $AWS_REGION \
    --query "ApiId" \
    --output text)

LAMBDA_ARN="arn:aws:lambda:${AWS_REGION}:${AWS_ACCOUNT}:function:paintbookco-segformer"

INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id $API_ID \
    --integration-type AWS_PROXY \
    --integration-uri $LAMBDA_ARN \
    --payload-format-version "2.0" \
    --region $AWS_REGION \
    --query "IntegrationId" \
    --output text)

aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key "POST /segment" \
    --target "integrations/$INTEGRATION_ID" \
    --region $AWS_REGION

aws apigatewayv2 create-stage \
    --api-id $API_ID \
    --stage-name "prod" \
    --auto-deploy \
    --region $AWS_REGION

aws lambda add-permission \
    --function-name paintbookco-segformer \
    --statement-id apigateway \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --region $AWS_REGION 2>/dev/null || echo "Permission already exists"

API_URL="https://${API_ID}.execute-api.${AWS_REGION}.amazonaws.com/prod/segment"
echo ""
echo "=== DEPLOYMENT COMPLETE ==="
echo "API URL: $API_URL"
echo "Add this to Supabase secrets: SEGFORMER_API_URL=$API_URL"
echo ""
echo "Test with:"
echo "curl -X POST $API_URL -H 'Content-Type: application/json' -d '{\"image_base64\": \"test\"}'"
