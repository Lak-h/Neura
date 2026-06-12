import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { env, features } from "@/lib/env";

/**
 * Secrets vault: AES-256-GCM with the key from SECRETS_ENCRYPTION_KEY.
 * Each value gets a fresh IV; the GCM auth tag is stored alongside so
 * tampering is detectable on decrypt.
 */

function vaultKey(): Buffer {
  if (!features.vault) {
    throw new Error("Secrets vault disabled: set SECRETS_ENCRYPTION_KEY (openssl rand -hex 32).");
  }
  return Buffer.from(env.SECRETS_ENCRYPTION_KEY!, "hex");
}

export function encryptSecret(plaintext: string): { encryptedValue: string; iv: string; authTag: string } {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", vaultKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    encryptedValue: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  };
}

export function decryptSecret(encryptedValue: string, iv: string, authTag: string): string {
  const decipher = createDecipheriv("aes-256-gcm", vaultKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(authTag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

// ── API keys ──
// Format: nrx_live_<40 hex chars>. Only the SHA-256 hash is stored.

export function generateApiKey(): { raw: string; hashed: string; prefix: string } {
  const raw = `nrx_live_${randomBytes(20).toString("hex")}`;
  return { raw, hashed: hashApiKey(raw), prefix: raw.slice(0, 13) };
}

export function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
