import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_ENV = "TOKEN_ENCRYPTION_KEY";
const KEY_LENGTH_BYTES = 32;
const IV_LENGTH_BYTES = 12;

function getKey(): Buffer {
  const secret = process.env[KEY_ENV];
  if (!secret) {
    throw new Error(`${KEY_ENV} is not configured`);
  }

  let keyBuffer: Buffer;

  try {
    keyBuffer = Buffer.from(secret, "base64");
  } catch (error) {
    throw new Error(`Failed to decode ${KEY_ENV} from base64`);
  }

  if (keyBuffer.length !== KEY_LENGTH_BYTES) {
    throw new Error(`${KEY_ENV} must decode to ${KEY_LENGTH_BYTES} bytes`);
  }

  return keyBuffer;
}

export interface EncryptedPayload {
  value: string;
  iv: string;
  tag: string;
}

export function encryptSecret(plainText: string): EncryptedPayload {
  if (!plainText) {
    throw new Error("Cannot encrypt empty value");
  }

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    value: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decryptSecret(payload: EncryptedPayload): string {
  const key = getKey();
  const iv = Buffer.from(payload.iv, "base64");
  const encrypted = Buffer.from(payload.value, "base64");
  const tag = Buffer.from(payload.tag, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
