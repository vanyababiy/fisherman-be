import type { AWS } from '@serverless/typescript';
import { fishermanImportUploadedBucketName } from '@constants/fisherman-import-uploaded.constant';
import { importFileParser, importProductsFile } from '@functions/index';


const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    stage: 'dev',
    runtime: 'nodejs14.x',
    region: 'eu-west-1',
    memorySize: 512,
    timeout: 15,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iam: {
      role: {
        'Fn::GetAtt': ['ImportServicePolicy', 'Arn'],
      },
    },
  },
  resources: {
    Resources: {
      ImportS3Bucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: fishermanImportUploadedBucketName,
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedOrigins: ['*'],
                AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
                AllowedHeaders: ['*'],
                MaxAge: 3000,
              },
            ],
          },
        },
      },
      ImportServicePolicy: {
        Type: 'AWS::IAM::Role',
        Properties: {
          RoleName: 'LambdasImportServiceAccess',
          AssumeRolePolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: {
                  Service: 'lambda.amazonaws.com',
                },
                Action: 'sts:AssumeRole',
              },
            ],
          },
          ManagedPolicyArns: ['arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'],
          Policies: [
            {
              PolicyName: 'ImportServiceAccess',
              PolicyDocument: {
                Version: '2012-10-17',
                Statement: [
                  {
                    Effect: 'Allow',
                    Action: [
                      's3:PutObject',
                      's3:PutObjectAcl',
                      's3:GetObject',
                      's3:DeleteObject',
                    ],
                    Resource: [
                      `arn:aws:s3:::${fishermanImportUploadedBucketName}/uploaded/*`,
                      `arn:aws:s3:::${fishermanImportUploadedBucketName}/parsed/*`,
                    ],
                  },
                ],
              },
            },
          ],
        },
      },
    },
  },
  // import the function via paths
  functions: {
    importProductsFile,
    importFileParser,
  },
  package: { individually: true },
  custom: {
    s3: {
      cors: {
        origins: ['*'],  // You can restrict this to specific origins
        methods: ['GET', 'PUT', 'POST', 'DELETE'],
        headers: ['*'],
      }
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
