import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEY_LENGTH = 64;

export function hashTemporaryPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");

  return `scrypt$${salt}$${hash}`;
}

export function verifyTemporaryPassword(
  password: string,
  storedHash: string
) {
  const [algorithm, salt, expectedHash] = storedHash.split("$");

  if (algorithm !== "scrypt" || !salt || !expectedHash) {
    return false;
  }

  const derivedHash = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  if (derivedHash.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedHash, expectedBuffer);
}
