import pako from "pako";
import type { ManagementProfile } from "@/lib/types";

const BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export type TripleProfile = {
  natural: ManagementProfile;
  working: ManagementProfile;
  recommended: ManagementProfile;
};

export function encodeTripleProfile(profiles: TripleProfile): string {
  const payload = JSON.stringify({
    n: profiles.natural,
    w: profiles.working,
    r: profiles.recommended,
  });
  const compressed = pako.gzip(payload);
  return bytesToBase62(Array.from(compressed));
}

export function decodeTripleProfile(code: string): TripleProfile | null {
  try {
    const bytes = base62ToBytes(code);
    const decompressed = pako.ungzip(new Uint8Array(bytes), { to: "string" });
    const payload = JSON.parse(decompressed);
    return { natural: payload.n, working: payload.w, recommended: payload.r };
  } catch {
    return null;
  }
}

function bytesToBase62(bytes: number[]): string {
  let num = BigInt(0);
  const twoFiftySix = BigInt(256);
  const sixtyTwo = BigInt(62);
  for (const byte of bytes) {
    num = num * twoFiftySix + BigInt(byte);
  }
  if (num === BigInt(0)) return "0";
  let result = "";
  while (num > BigInt(0)) {
    result = BASE62_CHARS[Number(num % sixtyTwo)] + result;
    num = num / sixtyTwo;
  }
  return result;
}

function base62ToBytes(base62: string): number[] {
  let num = BigInt(0);
  const sixtyTwo = BigInt(62);
  const twoFiftySix = BigInt(256);
  for (const char of base62) {
    const idx = BASE62_CHARS.indexOf(char);
    if (idx === -1) throw new Error("Invalid base62 character");
    num = num * sixtyTwo + BigInt(idx);
  }
  const bytes: number[] = [];
  let remaining = num;
  while (remaining > BigInt(0)) {
    bytes.unshift(Number(remaining % twoFiftySix));
    remaining = remaining / twoFiftySix;
  }
  return bytes;
}
