import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../lib/env.js';

function s3() {
  if (
    !env.S3_ENDPOINT ||
    !env.S3_BUCKET ||
    !env.S3_ACCESS_KEY_ID ||
    !env.S3_SECRET_ACCESS_KEY
  ) {
    throw new Error('S3 env vars not configured');
  }

  return new S3Client({
    region: env.S3_REGION ?? 'auto',
    endpoint: env.S3_ENDPOINT,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  });
}

export async function createPresignedPutUrl(input: { objectKey: string; contentType: string }) {
  const client = s3();
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET!,
    Key: input.objectKey,
    ContentType: input.contentType,
  });
  const url = await getSignedUrl(client, command, { expiresIn: 60 * 5 });
  const publicUrl =
    env.S3_PUBLIC_BASE_URL ? `${env.S3_PUBLIC_BASE_URL.replace(/\/$/, '')}/${input.objectKey}` : undefined;
  return { url, publicUrl };
}

