import { CryptoError } from "./error";
import { chacha20poly1305, xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { deriveKey, deriveKeyBytes, type SymmetricAlgorithm } from "./KeyDerivation";

const SALT_LENGTH = 16;

export interface EncryptionResult {
    ciphertext: Uint8Array<ArrayBuffer>,
    salt: Uint8Array<ArrayBuffer>,
    iv: Uint8Array<ArrayBuffer>,
    algorithm: SymmetricAlgorithm,
}

export type CryptoProgress = (step: number) => void;

export async function encryptText(plaintext: string, password: string, onProgress?: CryptoProgress, algorithm: SymmetricAlgorithm = "AES-256-GCM"): Promise<EncryptionResult> {
    const data = new TextEncoder().encode(plaintext);

    return encryptBytes(data, password, onProgress, algorithm);
}

export async function decryptText(ciphertext: Uint8Array<ArrayBuffer>, password: string, salt: Uint8Array<ArrayBuffer>, iv: Uint8Array<ArrayBuffer>, onProgress?: CryptoProgress, algorithm: SymmetricAlgorithm = "AES-256-GCM"): Promise<string> {
    const decryptedBytes = await decryptBytes(ciphertext, password, salt, iv, onProgress,algorithm);

    return new TextDecoder().decode(decryptedBytes);
}

export async function encryptBytes(data: Uint8Array<ArrayBuffer>, password: string, onProgress?: CryptoProgress, algorithm: SymmetricAlgorithm = "AES-256-GCM"): Promise<EncryptionResult> {
    onProgress?.(1);
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(algorithm === "XChaCha20-Poly1305" ? 24 : 12));
    onProgress?.(2);

    try {
        onProgress?.(3);
        let encryptedBytes: Uint8Array<ArrayBuffer>;

        if (algorithm === "ChaCha20-Poly1305") {
            const key = await deriveKeyBytes(password, salt, algorithm);
            encryptedBytes = chacha20poly1305(key, iv).encrypt(data) as Uint8Array<ArrayBuffer>;
        } else if (algorithm === "XChaCha20-Poly1305") {
            const key = await deriveKeyBytes(password, salt, algorithm);
            encryptedBytes = xchacha20poly1305(key, iv).encrypt(data) as Uint8Array<ArrayBuffer>;
        } else {
            const key = await deriveKey(password, salt, algorithm);
            const encryptedBuffer = await crypto.subtle.encrypt(
                { name: "AES-GCM", iv },
                key,
                data
            );
            encryptedBytes = new Uint8Array(encryptedBuffer) as Uint8Array<ArrayBuffer>;
        }

        return { ciphertext: encryptedBytes, salt, iv, algorithm };
    } catch {
        throw new CryptoError("ENCRYPTION_FAILED", "The resource could not be encrypted.");
    }
}

export async function decryptBytes(ciphertext: Uint8Array<ArrayBuffer>, password: string, salt: Uint8Array<ArrayBuffer>, iv: Uint8Array<ArrayBuffer>, onProgress?: CryptoProgress, algorithm: SymmetricAlgorithm = "AES-256-GCM"): Promise<Uint8Array<ArrayBuffer>> {
    onProgress?.(2);

    try {
        onProgress?.(3);
        let decryptedBytes: Uint8Array<ArrayBuffer>;

        if (algorithm === "ChaCha20-Poly1305") {
            const key = await deriveKeyBytes(password, salt, algorithm);
            decryptedBytes = chacha20poly1305(key, iv).decrypt(ciphertext) as Uint8Array<ArrayBuffer>;
        } else if (algorithm === "XChaCha20-Poly1305") {
            const key = await deriveKeyBytes(password, salt, algorithm);
            decryptedBytes = xchacha20poly1305(key, iv).decrypt(ciphertext) as Uint8Array<ArrayBuffer>;
        } else {
            const key = await deriveKey(password, salt, algorithm);
            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                key,
                ciphertext
            );
            decryptedBytes = new Uint8Array(decryptedBuffer) as Uint8Array<ArrayBuffer>;
        }

        return decryptedBytes;
    } catch {
        throw new CryptoError("AUTHENTICATION_FAILED", "The password is incorrect or the encryption resource has been modified");
    }
}