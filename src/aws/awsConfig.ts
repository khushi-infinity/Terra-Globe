import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

// Region configuration
export const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
export const S3_BUCKET_NAME = (process.env.TERRA_S3_BUCKET && process.env.TERRA_S3_BUCKET !== 'terra-evidence-storage')
  ? process.env.TERRA_S3_BUCKET
  : 'terra-evidence-552952091217';
export const DYNAMODB_REPORTS_TABLE = process.env.DYNAMODB_REPORTS_TABLE || 'TerraReports';
export const DYNAMODB_POSTS_TABLE = process.env.DYNAMODB_POSTS_TABLE || 'TerraPosts';

// Detect if real AWS credentials exist
export const hasAwsCredentials = Boolean(
  process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
);

// Real STS client for live IAM identity verification
export const stsClient = new STSClient({
  region: AWS_REGION,
  credentials: hasAwsCredentials
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    : undefined
});

// Real S3 client
export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: hasAwsCredentials
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    : undefined
});

// Real DynamoDB client
const rawDynamoClient = new DynamoDBClient({
  region: AWS_REGION,
  credentials: hasAwsCredentials
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    : undefined
});

export const dynamoDocClient = DynamoDBDocumentClient.from(rawDynamoClient, {
  marshallOptions: { removeUndefinedValues: true }
});

/**
 * Verify AWS Credentials using AWS STS GetCallerIdentity
 */
export async function verifyAwsCredentials() {
  if (!hasAwsCredentials) {
    return {
      connected: false,
      mode: 'LOCAL_SANDBOX',
      status: 'Awaiting AWS IAM Credentials in .env (Running in LocalStack / In-Memory Emulation)',
      message: 'Running in Local Emulation / LocalStack sandbox mode. To connect to live AWS Cloud, set AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY in .env.',
      requiredEnvVars: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION']
    };
  }

  try {
    const res = await stsClient.send(new GetCallerIdentityCommand({}));
    return {
      connected: true,
      mode: 'LIVE_AWS_CLOUD',
      status: 'Authenticated to AWS Cloud',
      accountId: res.Account,
      arn: res.Arn,
      userId: res.UserId,
      region: AWS_REGION
    };
  } catch (err: any) {
    return {
      connected: false,
      mode: 'AUTH_FAILED',
      status: 'AWS IAM Authentication Failed',
      error: err.message,
      message: 'AWS IAM authentication failed. Please verify that your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are active.'
    };
  }
}

/**
 * Generate AWS S3 Pre-Signed Upload URL
 */
export async function generateS3PresignedUploadUrl(fileName: string, contentType: string) {
  const sanitizedFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const key = `pollution-evidence/${sanitizedFileName}`;

  if (hasAwsCredentials) {
    try {
      const command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        ContentType: contentType
      });
      // 15 minutes expiration
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
      const publicUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
      return { uploadUrl, publicUrl, key, mode: 'LIVE_AWS_S3' };
    } catch (e: any) {
      console.warn('Real S3 presigned URL failed, falling back to local sandbox:', e.message);
    }
  }

  // Simulated Pre-Signed URL for Local / Sandbox environments
  const uploadUrl = `/api/aws/s3/upload-mock?key=${encodeURIComponent(key)}`;
  const publicUrl = `/api/aws/s3/files/${encodeURIComponent(key)}`;
  return { uploadUrl, publicUrl, key, mode: 'LOCAL_SANDBOX' };
}

/**
 * Cloud Architecture Metadata
 */
export const AWS_ARCHITECTURE_INFO = {
  region: AWS_REGION,
  s3Bucket: S3_BUCKET_NAME,
  dynamoDbTables: {
    reports: DYNAMODB_REPORTS_TABLE,
    posts: DYNAMODB_POSTS_TABLE
  },
  cognitoUserPoolId: 'us-east-1_TerraAuthPool',
  cognitoClientId: 'terra7client98213894',
  apiGatewayStage: 'prod',
  iamRolePolicy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: [
          'sts:GetCallerIdentity',
          's3:PutObject',
          's3:GetObject',
          'dynamodb:PutItem',
          'dynamodb:GetItem',
          'dynamodb:Query',
          'dynamodb:Scan'
        ],
        Resource: [
          `arn:aws:s3:::${S3_BUCKET_NAME}/*`,
          `arn:aws:dynamodb:${AWS_REGION}:*:table/${DYNAMODB_REPORTS_TABLE}`,
          `arn:aws:dynamodb:${AWS_REGION}:*:table/${DYNAMODB_POSTS_TABLE}`
        ]
      }
    ]
  }
};
