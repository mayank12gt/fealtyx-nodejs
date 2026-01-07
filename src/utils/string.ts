/**
 * Converts a hex character ('0'-'9', 'a'-'f', 'A'-'F') to a number between 0-15
 * @param c - The hex character to convert
 * @returns A number between 0-15 representing the hex value, or 0 if the character is invalid
 */
export function hexCharToByte(c: string): number {
    // Ensure we only process the first character if a longer string is passed
    const char = c.charAt(0);
    
    if (char >= '0' && char <= '9') {
        return char.charCodeAt(0) - '0'.charCodeAt(0);
    } else if (char >= 'a' && char <= 'f') {
        return char.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
    } else if (char >= 'A' && char <= 'F') {
        return char.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
    } else {
        return 0;
    }
}
