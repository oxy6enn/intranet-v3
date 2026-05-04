import assert from "node:assert/strict";
import {
  hashTemporaryPassword,
  verifyTemporaryPassword,
} from "../src/lib/temp-password";
import { registerTest } from "./test-kit";

registerTest("hashTemporaryPassword stores values in scrypt format", () => {
  const hash = hashTemporaryPassword("TempPass123!");
  const parts = hash.split("$");

  assert.equal(parts[0], "scrypt");
  assert.equal(parts.length, 3);
  assert.ok(parts[1].length > 0);
  assert.ok(parts[2].length > 0);
});

registerTest("verifyTemporaryPassword accepts the correct password", () => {
  const password = "TempPass123!";
  const hash = hashTemporaryPassword(password);

  assert.equal(verifyTemporaryPassword(password, hash), true);
});

registerTest("verifyTemporaryPassword rejects the wrong password", () => {
  const hash = hashTemporaryPassword("TempPass123!");

  assert.equal(verifyTemporaryPassword("WrongPass123!", hash), false);
});

registerTest("verifyTemporaryPassword rejects malformed hashes", () => {
  assert.equal(verifyTemporaryPassword("TempPass123!", "plain-text"), false);
  assert.equal(verifyTemporaryPassword("TempPass123!", "bcrypt$salt$hash"), false);
});
