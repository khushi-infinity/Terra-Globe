/**
 * AWS Lambda Function: S3PresignedUrlHandler
 * 
 * Generates an AWS S3 Pre-Signed URL for direct client-side photo evidence uploads.
 * Keeps serverless compute lightweight and protects bucket privacy.
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const BUCKET_NAME = process.env.TERRA_S3_BUCKET || 'terra-evidence-storage';

interface APIGatewayEvent {
  httpMethod: string;
  body?: string | null;
}

export const handler = async (event: APIGatewayEvent) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  };

  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const { fileName = 'evidence.jpg', contentType = 'image/jpeg' } =
      typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {});

    const sanitized = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const key = `reports/${sanitized}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType
    });

    // 15-minute validity window
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        uploadUrl,
        publicUrl,
        key,
        bucket: BUCKET_NAME,
        expiresInSeconds: 900
      })
    };
  } catch (err: any) {
    console.error('S3 Pre-Signed URL Lambda generation failed:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to generate pre-signed URL', details: err.message })
    };
  }
};
