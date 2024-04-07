import { Construct, Duration } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

export interface BackendProps extends cdk.StackProps {
  stage?: string;
}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: BackendProps) {
    super(scope, id, props);
    const { stage } = props!;

    //Bucket
    const fovusS3Bucket = new s3.Bucket(this, `fovus-bucket-${stage}`, {
      bucketName: `fovus-bucket-${stage}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    //Table
    const fovusDynamodb = new dynamodb.Table(this, `fovus-table-${stage}`, {
      tableName: `fovus-table-${stage}`,
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "created_at", type: dynamodb.AttributeType.NUMBER },
    });

    //Lambda
    const fovusLambda = new lambda.Function(this, `fovus-lambda-${stage}`, {
      functionName: `fovus-lambda-${stage}`,
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "../lambda")),
      environment: {
        TABLE_NAME: fovusDynamodb.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
      initialPolicy: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["s3:*"],
          resources: [fovusS3Bucket.bucketArn],
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["dynamodb:*"],
          resources: [fovusDynamodb.tableArn],
        }),
      ],
    });

    //Permissions
    fovusDynamodb.grantReadWriteData(fovusLambda);
    fovusS3Bucket.grantReadWrite(fovusLambda);

    //EC2 instance
    const fovusEC2 = new ec2.Instance(this, `fovus-instance-${stage}`, {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      vpc: new ec2.Vpc(this, `fovus-vpc-${stage}`),
      userData: ec2.UserData.custom(`
      #!/bin/bash
      yum update -y
      yum install -y aws-cli
  
      # Fetch all items from DynamoDB File Table
      items=$(aws dynamodb scan --table-name ${fovusDynamodb.tableName} --query "Items[]" --output text)
  
      # Loop through each item and process them
      while IFS= read -r item; do
        id=$(echo $item | jq -r '.id.S')
        input=$(echo $item | jq -r '.input.S')
        filePath=$(echo $item | jq -r '.filePath.S')

        aws s3 cp s3://${fovusS3Bucket.bucketName}/$filePath /home/ec2-user/input_$id.txt
  
        echo "File Content : $input" >> /home/ec2-user/input_$id.txt
        mv /home/ec2-user/input_$id.txt /home/ec2-user/output_$id.txt
  
        aws s3 cp /home/ec2-user/output_$id.txt s3://${fovusS3Bucket.bucketName}/output_$id.txt
      done <<< "$items"
    `),
    });

    //Trigger
    const rule = new events.Rule(this, `fovus-dynamodb-trigger-${stage}`, {
      eventPattern: {
        source: ["aws.dynamodb"],
        detail: {
          eventSource: ["dynamodb.amazonaws.com"],
          eventName: ["PutItem"],
          requestParameters: {
            tableName: [fovusDynamodb.tableName],
          },
        },
      },
    });
    rule.addTarget(new targets.InstanceId(fovusEC2));
  }
}
