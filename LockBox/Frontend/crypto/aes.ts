import { CryptoError } from "./error";
import { deriveKey } from "./KeyDerivation";

const IV_LENGTH = 12;
const SALT_LENGTH = 16;

export interface EncryptionResult {
    ciphertext: Uint8Array<ArrayBuffer>,
    salt: Uint8Array<ArrayBuffer>,
    iv: Uint8Array<ArrayBuffer>
}

export type CryptoProgress = (step: number) => void;

export async function encryptText(plaintext: string, password: string, onProgress?: CryptoProgress): Promise<EncryptionResult> {
    const data = new TextEncoder().encode(plaintext);

    return encryptBytes(data, password, onProgress);
}

export async function decryptText(ciphertext: Uint8Array<ArrayBuffer>, password: string, salt: Uint8Array<ArrayBuffer>, iv: Uint8Array<ArrayBuffer>, onProgress?: CryptoProgress): Promise<string> {
    const decryptedBytes = await decryptBytes(ciphertext, password, salt, iv, onProgress);

    return new TextDecoder().decode(decryptedBytes);
}

export async function encryptBytes(data: Uint8Array<ArrayBuffer>, password: string, onProgress?: CryptoProgress): Promise<EncryptionResult> {
    onProgress?.(1);
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    onProgress?.(2);
    const key = await deriveKey(password, salt);

    try {
        onProgress?.(3);
        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            data
        );

        return {
            ciphertext: new Uint8Array(encryptedBuffer),
            salt,
            iv
        };
    } catch {
        throw new CryptoError("ENCRYPTION_FAILED", "The resource could not be encrypted.");
    }
}

export async function decryptBytes(ciphertext: Uint8Array<ArrayBuffer>, password: string, salt: Uint8Array<ArrayBuffer>, iv: Uint8Array<ArrayBuffer>, onProgress?: CryptoProgress): Promise<Uint8Array> {
    onProgress?.(2);
    const key = await deriveKey(password, salt);

    try {
        onProgress?.(3);
        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            ciphertext
        );

        return new Uint8Array(decryptedBuffer);
    } catch {
        throw new CryptoError("AUTHENTICATION_FAILED", "The password is incorrect or the encryption resource has been modified");
    }
}