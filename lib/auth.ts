import crypto from "crypto";

const SALT = process.env.AUTH_SECRET || "nsuk-senate-salt-2024";

/**
 * Hash a password using Node.js built-in scrypt
 */
export function hashPassword(password: string): string {
  return crypto.scryptSync(password, SALT, 64).toString("hex");
}

/**
 * Verify a plain text password against a stored scrypt hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const computedHash = hashPassword(password);
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, "hex"),
      Buffer.from(storedHash, "hex")
    );
  } catch {
    return false;
  }
}

export interface AdminSessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string | null;
}

/**
 * Create a signed session token
 */
export function createSessionToken(user: AdminSessionUser): string {
  const payload = {
    ...user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SALT).update(data).digest("base64url");
  return `${data}.${signature}`;
}

/**
 * Verify a signed session token
 */
export function verifySessionToken(token: string): (AdminSessionUser & { exp: number }) | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [data, signature] = parts;

    const expectedSignature = crypto.createHmac("sha256", SALT).update(data).digest("base64url");
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf-8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}
