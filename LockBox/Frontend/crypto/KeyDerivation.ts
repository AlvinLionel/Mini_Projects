const PBKDF2_ITERATIONS = 600_000;
const HASH_ALGORITHM = "SHA-256";
const KEY_LENGTH = 256;

export async function deriveKey(password:string, salt:Uint8Array<ArrayBuffer>) : Promise<CryptoKey>{
    const passwordKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: PBKDF2_ITERATIONS,
            hash: HASH_ALGORITHM,
        },
        passwordKey,
        {
            name: "AES-GCM",
            length: KEY_LENGTH
        },
        false,
        ["encrypt", "decrypt"]
    );
}