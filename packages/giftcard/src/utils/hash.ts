import * as crypto from 'crypto';

/**
 * Returns the SHA-256 hash of the input string.
 * If the input string is already hashed, returns the string as it is.
 * @param s - The string to hash
 * @returns The SHA-256 hash of the input string
 */
export function getSHA256Hash(s: string): string {
    if (s === '' || isSHA256Hash(s)) {
        return s;
    }

    // Create a new SHA-256 hash
    const hash = crypto.createHash('sha256');

    // Update the hash with the input string
    hash.update(s);

    // Get the hash as a hexadecimal string
    return hash.digest('hex');
}

/**
 * Checks if the input string is a SHA-256 hash.
 * @param s - The string to check
 * @returns True if the string is a SHA-256 hash, false otherwise
 */
export function isSHA256Hash(s: string): boolean {
    // SHA-256 hash: 64-character hexadecimal string
    const sha256Regex = /^[a-fA-F0-9]{64}$/;
    return sha256Regex.test(s);
}


/**
 * Generates SHA256 hash for phone number.
 * If the phone number doesn't start with +91, adds +91.
 * If the phone number is already hashed, returns the string as it is.
 * @param phoneNum - The phone number to hash
 * @returns The SHA-256 hash of the phone number
 */
export function getPhoneNumberHash(phoneNum: string): string {
    if (phoneNum === '' || isSHA256Hash(phoneNum)) {
        return phoneNum;
    }
    
    if (phoneNum.startsWith('+91')) {
        return getSHA256Hash(phoneNum);
    }
    
    return getSHA256Hash('+91' + phoneNum);
}
