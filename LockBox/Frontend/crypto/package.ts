import type { EncryptionResult } from "./aes";
import { CryptoError } from "./error";
import type { ResourceType } from "./resourceCrypto";

const PACKAGE_PREFIX = "LBX1";
const ALGORITHM = "AES-256-GCM";

export interface LockBoxPackage {
    version: 1;
    algorithm: typeof ALGORITHM;
    resourceType: ResourceType;
    filename?: string;
    mimeType?: string;
    salt: string;
    iv: string;
    ciphertext: string
}
export interface ResourceMetadata {
    resourceType: ResourceType;
    filename?: string;
    mimeType?: string;
}

function bytesToBase64(bytes: Uint8Array): string {
    let binary = "";

    for (const byte of bytes) binary += String.fromCharCode(byte);

    return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
    const binary = atob(base64);
    const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(new ArrayBuffer(binary.length));

    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    return bytes;
}

export function createPackage(result: EncryptionResult, metadata: ResourceMetadata): string {
    const packageData: LockBoxPackage = {
        version: 1,
        algorithm: ALGORITHM,
        resourceType: metadata.resourceType,
        filename: metadata.filename,
        mimeType: metadata.mimeType,
        salt: bytesToBase64(result.salt),
        iv: bytesToBase64(result.iv),
        ciphertext: bytesToBase64(result.ciphertext),
    };
    const encodedData = btoa(JSON.stringify(packageData));

    return `${PACKAGE_PREFIX}.${encodedData}`;
}
export function parsePackage(encryptedPackage: string): LockBoxPackage {
    if (!encryptedPackage.startsWith(`${PACKAGE_PREFIX}.`)) throw new CryptoError("INVALID_PACKAGE", "This does not appear to be a valid LockBox package");

    const encodedData = encryptedPackage.slice(PACKAGE_PREFIX.length + 1);
    let packageData: LockBoxPackage;

    try {
        packageData = JSON.parse(atob(encodedData));
        console.log("Decoded package data:", packageData);
    } catch { throw new Error("Corrupted LockBox package") }

    if (packageData.version !== 1 || packageData.algorithm !== ALGORITHM || !packageData.resourceType || !packageData.salt || !packageData.iv || !packageData.ciphertext)
        throw new CryptoError("INVALID_PACKAGE", "The LockBox package is missing required encryption data.");

    return packageData;
}

export function unpackage(encryptedPackage: string) {
    const packageData = parsePackage(encryptedPackage);

    return {
        resourceType: packageData.resourceType,
        filename: packageData.filename,
        mimeType: packageData.mimeType,
        salt: base64ToBytes(packageData.salt),
        iv: base64ToBytes(packageData.iv),
        ciphertext: base64ToBytes(packageData.ciphertext),
    };
}