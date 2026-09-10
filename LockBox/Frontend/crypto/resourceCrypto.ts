import { encryptBytes, decryptBytes, type CryptoProgress, type EncryptionResult } from "./aes";
import { type LockBoxPackage, base64ToBytes } from "./package";

const PACKAGE_PREFIX = "LBX1";
export type ResourceType = "text" | "file" | "image" | "audio" | "video" | "folder";

export async function resourceToBytes(resource: string | File, resourceType: ResourceType): Promise<Uint8Array<ArrayBuffer>> {
    if (resourceType === "text")
        return new TextEncoder().encode(resource as string) as Uint8Array<ArrayBuffer>;

    if (resourceType === "file" || resourceType === "image" || resourceType === "audio" || resourceType === "video") {
        if (!(resource instanceof File))
            throw new Error("A file resource is required");

        const buffer = await resource.arrayBuffer();
        return new Uint8Array(buffer) as Uint8Array<ArrayBuffer>;
    }

    throw new Error(`Unsupported resource type: ${resourceType}`);
}
export async function encryptResource(resource: string | File, resourceType: ResourceType, password: string): Promise<EncryptionResult> {
    const bytes: Uint8Array<ArrayBuffer> = await resourceToBytes(resource, resourceType);

    return encryptBytes(bytes, password);
}
export async function decryptResource(ciphertext: Uint8Array<ArrayBuffer>, password: string, salt: Uint8Array<ArrayBuffer>, iv: Uint8Array<ArrayBuffer>, resourceType: ResourceType): Promise<string | Uint8Array> {
    const decryptedBytes = await decryptBytes(ciphertext, password, salt, iv);
    if (resourceType === "text")
        return new TextDecoder().decode(decryptedBytes);

    return decryptedBytes;
}

export async function encryptFile(file: File, resourceType: ResourceType, password: string, onProgress?: CryptoProgress): Promise<{
    result: EncryptionResult;
    metadata: {
        resourceType: ResourceType;
        filename: string; mimeType:
        string
    };
}> {
    const bytes = await resourceToBytes(file, resourceType);
    const result = await encryptBytes(bytes, password, onProgress);

    return {
        result,
        metadata: {
            resourceType,
            filename: file.name,
            mimeType: file.type || "application/octet-stream",
        }
    };
}

export async function decryptFile(packageString: string, password: string, onProgress?: CryptoProgress): Promise<File> {
    const packageData = parsePackage(packageString);
    const salt = base64ToBytes(packageData.salt);
    const iv = base64ToBytes(packageData.iv);
    const ciphertext = base64ToBytes(packageData.ciphertext);
    const decryptedBytes = await decryptBytes(ciphertext, password, salt, iv, onProgress);

    const decryptedBlob = new Blob(
        [decryptedBytes.buffer as ArrayBuffer],
        { type: packageData.mimeType || "application/octet-stream" }
    );

    return new File(
        [decryptedBlob],
        packageData.filename || "decrypted-file",
        { type: decryptedBlob.type }
    );
}

export function downloadFile(file:File):void{
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

export function parsePackage(packageString: string): LockBoxPackage {
    if (!packageString.startsWith(`${PACKAGE_PREFIX}.`)) {
        throw new Error("Invalid LockBox package.");
    }

    const encodedData = packageString.slice(PACKAGE_PREFIX.length + 1);

    let decodedData: string;

    try {
        decodedData = atob(encodedData);
    } catch {
        throw new Error("Invalid LockBox package encoding.");
    }

    let packageData: LockBoxPackage;

    try {
        packageData = JSON.parse(decodedData);
    } catch {
        throw new Error("Invalid LockBox package data.");
    }

    if (packageData.version !== 1) {
        throw new Error("Unsupported LockBox package version.");
    }
    if (!packageData.algorithm) {
        throw new Error("LockBox package is missing its algorithm.");
    }
    if (!packageData.resourceType) {
        throw new Error("LockBox package is missing its resource type.");
    }
    if (!packageData.salt) {
        throw new Error("LockBox package is missing its salt.");
    }
    if (!packageData.iv) {
        throw new Error("LockBox package is missing its IV.");
    }
    if (!packageData.ciphertext) {
        throw new Error("LockBox package is missing its ciphertext.");
    }

    return packageData;
}