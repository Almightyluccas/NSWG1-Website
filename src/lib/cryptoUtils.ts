// import crypto from 'crypto';
//
// const ALGORITHM = 'aes-256-cbc';
// const KEY = process.env.NEXTAUTH_SECRET as string;
// const IV_LENGTH = 16;
//
// if (!KEY || KEY.length !== 64) {
//   throw new Error('REFRESH_TOKEN_KEY must be set to a 64-character hexadecimal string.');
// }
//
// export function encryptToken(token: string): string {
//   const iv = crypto.randomBytes(IV_LENGTH);
//   const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY, 'hex'), iv);
//   let encrypted = cipher.update(token, 'utf8');
//   encrypted = Buffer.concat([encrypted, cipher.final()]);
//   return iv.toString('hex') + ':' + encrypted.toString('hex');
// }
//
// export function decryptToken(encryptedToken: string): string {
//   const parts = encryptedToken.split(':');
//   if (parts.length !== 2) {
//     throw new Error('Invalid encrypted token format.');
//   }
//   const iv = Buffer.from(parts[0], 'hex');
//   const encrypted = Buffer.from(parts[1], 'hex');
//   const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY, 'hex'), iv);
//   let decrypted = decipher.update(encrypted);
//   decrypted = Buffer.concat([decrypted, decipher.final()]);
//   return decrypted.toString('utf8');
// }

export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  // crypto.subtle is the Web Crypto API, available on the Edge
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert the ArrayBuffer to a hexadecimal string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}