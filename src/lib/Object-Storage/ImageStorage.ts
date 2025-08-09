import {DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import sharp from 'sharp';
import {randomUUID} from "crypto";

class ImageStorageService {
  readonly #s3Client: S3Client;
  readonly #bucketName: string;

  constructor() {
    if (typeof window !== 'undefined') {
      throw new Error("ImageStorageService can only be used on the server-side.");
    }

    const accessKeyId: string | undefined = process.env.OCI_ACCESS_KEY_ID;
    const secretAccessKey: string | undefined = process.env.OCI_SECRET_ACCESS_KEY;
    const bucketName: string | undefined = process.env.OCI_BUCKET_NAME;
    const endpoint: string | undefined = process.env.OCI_ENDPOINT;
    const region = "us-ashburn-1";

    if (!accessKeyId || !secretAccessKey || !bucketName || !endpoint) {
      throw new Error("Missing required environment variables for ImageStorageService.");
    }

    this.#bucketName = bucketName;

    this.#s3Client = new S3Client({
      endpoint: endpoint,
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadProfilePicture(fileBuffer: Buffer): Promise<{ key: string }> {
    const key = `profiles/${randomUUID()}.webp`;

    const optimizedBuffer: Buffer<ArrayBufferLike> = await sharp(fileBuffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    return this.#upload(key, optimizedBuffer, 'image/webp');
  }

  async uploadBackgroundImage(fileBuffer: Buffer): Promise<{ key: string }> {
    const key = `backgrounds/${randomUUID()}.webp`;

    const optimizedBuffer = await sharp(fileBuffer)
      .webp({ quality: 85 })
      .toBuffer();

    return this.#upload(key, optimizedBuffer, 'image/webp');
  }

  async #upload(key: string, body: Buffer, contentType: string): Promise<{ key: string }> {
    const command = new PutObjectCommand({
      Bucket: this.#bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.#s3Client.send(command);
    return { key };
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.#bucketName,
      Key: key,
    });

    try {
      await this.#s3Client.send(command);
    } catch (error) {
      console.error(`Failed to delete object from S3: ${key}`, error);
      throw error;
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    if (!key) return "/default-avatar.png";

    const command = new GetObjectCommand({
      Bucket: this.#bucketName,
      Key: key,
    });

    try {
      return await getSignedUrl(this.#s3Client, command, {expiresIn: 3600});
    } catch (error) {
      console.error("Error generating signed URL for key", key, error);
      return "/default-avatar.png";
    }
  }

  async createPresignedUploadUrl(uploadType: 'profile' | 'background', contentType: string): Promise<{ url: string, key:string }> {
    const key = `${uploadType}s/${randomUUID()}.webp`;

    const command = new PutObjectCommand({
      Bucket: this.#bucketName,
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(
      this.#s3Client,
      command,
      { expiresIn: 300 }
    );
    return { url, key };
  }
}

const imageStorageService = new ImageStorageService();
export default imageStorageService;