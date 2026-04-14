import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

/**
 * Загружает Buffer напрямую в R2.
 * Возвращает публичный URL файла в R2.
 */
export async function uploadBuffer(buffer, contentType, userUid, folder = 'generations') {
  const ext = contentType.split('/')[1]?.split('+')[0] || 'png';
  const key = `users/${userUid}/${folder}/${uuidv4()}.${ext}`;

  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

/**
 * Скачивает файл по URL и загружает в R2.
 * Возвращает публичный URL файла в R2.
 */
export async function uploadFromUrl(sourceUrl, userUid, folder = 'generations') {
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Failed to fetch file: ${response.status}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('content-type') || 'image/png';
  const ext = contentType.split('/')[1]?.split('+')[0] || 'png';
  const key = `users/${userUid}/${folder}/${uuidv4()}.${ext}`;

  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

/**
 * Удаляет файл из R2 по ключу.
 */
export async function deleteFromR2(key) {
  await r2.send(new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  }));
}
