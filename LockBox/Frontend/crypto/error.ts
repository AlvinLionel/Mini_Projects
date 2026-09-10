export type CryptoErrorCode =
    "INVALID_PACKAGE" |
    "AUTHENTICATION_FAILED" |
    "ENCRYPTION_FAILED" |
    "DECRYPTION_FAILED";
export class CryptoError extends Error {
    code: CryptoErrorCode;

    constructor(code: CryptoErrorCode, message: string) {
        super(message);
        this.name = "CrptoError";
        this.code = code;
    }
}