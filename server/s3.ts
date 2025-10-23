import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'node:crypto'
import { Upload } from "@aws-sdk/lib-storage";
import { env } from '@/env/server';
import { createMiddleware } from 'hono/factory';

export type R2S3Config = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
}

type ImageProcessVariables = {
  imageS3Url: string
}

export function createR2S3Client(config: R2S3Config) {
  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`

  const client = new S3Client({
    endpoint,
    forcePathStyle: true,
    region: 'auto',
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
  return client
}


export function uploadBodyImageToS3() {
  const client = createR2S3Client({
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucketName: env.R2_BUCKET_NAME,
  })
  return createMiddleware<{
    Variables: ImageProcessVariables
  }>(async (c, next) => {
    const body = c.req.raw.body;
    if (!body) {
      return c.text('No body provided', 400)
    }
    const key = crypto.randomUUID()
    const upload = new Upload({
      client,
      params: {
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Body: body,
      },
    })
    const imageUrl = await upload.done().then((result) => {
      const command = new GetObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: result.Key,
      })
      return getSignedUrl(client, command, { expiresIn: 600 })
    }).catch((error) => {
      console.error("Error uploading object:", error);
      return null
    })
    if (!imageUrl) {
      return c.text('Error uploading image', 500)
    }
    c.set('imageS3Url', imageUrl)
    await next();
  })
}