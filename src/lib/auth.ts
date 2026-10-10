const SECRET =
  process.env.AUTH_SECRET ||
  "tecra_super_secret_auth_key_change_in_production_min_32_chars";

export const COOKIE_NAME = "tecra_admin_session";

export interface SessionPayload {
  email: string;
  role: "admin";
  issuedAt: number;
  expiresAt: number;
}

// Convert string secret to CryptoKey
async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

// Base64Url encoding/decoding helpers
function base64UrlEncode(str: string): string {
  const enc = new TextEncoder();
  const bytes = enc.encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(base64url: string): string {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const dec = new TextDecoder();
  return dec.decode(bytes);
}

function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Sign a session token for an admin user
 */
export async function signSession(email: string): Promise<string> {
  const payload: SessionPayload = {
    email,
    role: "admin",
    issuedAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days validity
  };

  const payloadStr = JSON.stringify(payload);
  const data = base64UrlEncode(payloadStr);

  const key = await getCryptoKey();
  const enc = new TextEncoder();
  const signatureBuf = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const signature = bufferToBase64Url(signatureBuf);

  return `${data}.${signature}`;
}

/**
 * Verify a session token and return its payload
 */
export async function verifySession(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  try {
    const key = await getCryptoKey();
    const enc = new TextEncoder();

    // Reconstruct binary signature for verification
    let sigBase64 = signature.replace(/-/g, "+").replace(/_/g, "/");
    while (sigBase64.length % 4) {
      sigBase64 += "=";
    }
    const sigBinary = atob(sigBase64);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      enc.encode(data)
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(data);
    const payload: SessionPayload = JSON.parse(payloadJson);

    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
