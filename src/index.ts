import { Reason } from "./interface/reason";
import { getSHA256Hash, isSHA256Hash, getPhoneNumberHash } from "./utils/hash";
import { hexCharToByte } from "./utils/string";

export type ValidationResult = {
  is_applicable: boolean;
  is_fealtyx_discount_code: boolean;
  reason: Reason | null;
};


export function validateUnloqDiscountCode(
  domain: string,
  phoneNumber: string,
  giftCardCode: string,
  orderAmount: number
): ValidationResult {
  // First, clean the gift card code
  giftCardCode = giftCardCode.toLowerCase().trim();

  // If gift card code is too short, return
  if (!giftCardCode || giftCardCode.length < 4) {
    return {
      is_applicable: true,
      is_fealtyx_discount_code: false,
      reason: null,
    };
  }

  // Check if gift card code starts with "flx" or "unq"
  if (!giftCardCode.startsWith("flx") && !giftCardCode.startsWith("unq")) {
    return {
      is_applicable: true,
      is_fealtyx_discount_code: false,
      reason: null,
    };
  }

  // Get last 4 characters of the code
  const last4 = giftCardCode.slice(-4);
  if (last4.length !== 4) {
    return {
      is_applicable: true,
      is_fealtyx_discount_code: false,
      reason: null,
    };
  }

  const first2 = last4.slice(0, 2);
  const actualLast2 = last4.slice(2);

  // Step 1: Check if this is an Fealtyx gift card by checking if the last 2 characters match the expected last 2 characters
  const expectedLast2 = generateLast2FromFirst2(first2);
  if (actualLast2 !== expectedLast2) {
    // If the last 2 don't match the expected pattern, the gift card is not a Fealtyx gift card
    return {
      is_applicable: true,
      is_fealtyx_discount_code: false,
      reason: null,
    };
  }

  // Sanitize domain
  const { result: sanitizedDomain, error: err } = sanitizeDomain(domain);
  if (err !== null) {
    return {
      is_applicable: false,
      is_fealtyx_discount_code: true,
      reason: Reason.InvalidDomain,
    };
  }

  // Step 2: Verify full code - generate expected suffix
  const expectedSuffix = getGiftCardCodeIdentifier(sanitizedDomain, phoneNumber).toLowerCase();

  // Case-insensitive match
  const valid = expectedSuffix.toLowerCase() === last4.toLowerCase();
  if (!valid) {
    return {
      is_applicable: false,
      is_fealtyx_discount_code: true,
      reason: Reason.VoucherNotEligible,
    };
  }

  return {
    is_applicable: true,
    is_fealtyx_discount_code: true,
    reason: null,
  };
}

// Helper function to generate last 2 characters from first 2 characters
function generateLast2FromFirst2(first2: string): string {
  const alphanum = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charsetLen = alphanum.length;

  if (first2.length !== 2) {
    return "";
  }

  // Convert hex characters to numeric byte values
  const c1 = first2[0];
  const c2 = first2[1];

  const b1 = hexCharToByte(c1);
  const b2 = hexCharToByte(c2);

  // Get XOR and sum of first 2 characters
  const xor = b1 ^ b2;
  const sum = b1 + b2;

  // Map XOR and sum results to character set
  const idx1 = xor % charsetLen;
  const idx2 = sum % charsetLen;

  return alphanum[idx1] + alphanum[idx2];
}


function getGiftCardCodeIdentifier(
  partnerEntityId: string,
  phoneNumber: string
): string {
  let hashedPhoneNumber: string;

  hashedPhoneNumber = getPhoneNumberHash(phoneNumber);
 

  const alphanum = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charsetLen = alphanum.length;
  let input = (partnerEntityId + hashedPhoneNumber).toLowerCase();

  const hash = getSHA256Hash(input);

  const c1 = hash[0];
  const c2 = hash[1];

  const b1 = hexCharToByte(c1);
  const b2 = hexCharToByte(c2);

  const xor = b1 ^ b2;
  const idx1 = xor % charsetLen;
  const idx2 = (b1 + b2) % charsetLen;

  return `${c1}${c2}${alphanum[idx1]}${alphanum[idx2]}`;
}


function sanitizeDomain(input: string): { result: string; error: Error | null } {
    input = input.trim();
    
    // Add scheme if missing to make it a valid URL
    if (!input.includes('://')) {
        input = 'https://' + input;
    }
    
    let parsed: URL;
    try {
        parsed = new URL(input);
    } catch (err) {
        return { 
            result: '', 
            error: new Error(`invalid domain: ${err instanceof Error ? err.message : String(err)}`) 
        };
    }
    
    // Extract host and convert to lowercase
    const domain = parsed.hostname.toLowerCase();
    if (!domain) {
        return { result: '', error: new Error('empty domain') };
    }
    
    return { result: domain, error: null };
}