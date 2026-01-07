export enum Reason {
    CodeTooShort = "Code Too Short",
    InvalidDomain = "Invalid Domain",
    VoucherNotEligible = "Voucher Not Eligible For The User",
    InvalidPhone = "Invalid Phone Number",
    InvalidOrderAmount = "Invalid Order Amount",
}

export namespace Reason {
    /**
     * Returns the string representation of a Reason.
     * If the input is empty/undefined/null, returns Reason.Unknown.
     */
    export function String(r?: Reason | string | null): string | null {
        if (r === undefined || r === null || r === "") {
            return null;
        }
        return String(r);
    }
}