import crypto from "node:crypto";

import { appConfig, assertTokenEncryptionConfig } from "@/lib/config";

const algorithm = "aes-256-gcm";

const getKey = () => {
  assertTokenEncryptionConfig();
  const key = Buffer.from(appConfig.tokenEncryptionKey!, "base64");
  if (key.byteLength !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be 32 bytes encoded as base64.");
  }
  return key;
};

export const encryptString = (value: string) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    value: encrypted.toString("base64"),
  });
};

export const decryptString = (payload: string | null | undefined) => {
  if (!payload) return undefined;
  const parsed = JSON.parse(payload) as { iv: string; tag: string; value: string };
  const decipher = crypto.createDecipheriv(
    algorithm,
    getKey(),
    Buffer.from(parsed.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(parsed.tag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(parsed.value, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
};

export const signState = (nonce: string) => {
  if (!appConfig.adminSecret) throw new Error("ADMIN_SECRET is required.");
  return crypto
    .createHmac("sha256", appConfig.adminSecret)
    .update(nonce)
    .digest("base64url");
};

export const makeOAuthState = () => {
  const nonce = crypto.randomBytes(18).toString("base64url");
  return `${nonce}.${signState(nonce)}`;
};

export const verifyOAuthState = (state: string | null) => {
  if (!state) return false;
  const [nonce, signature] = state.split(".");
  if (!nonce || !signature) return false;
  const expected = signState(nonce);
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};
