import { validateUnloqDiscountCode } from '../index';
import { Reason } from '../interface/reason';
import { getSHA256Hash } from '../utils/hash';

describe('validateGiftCardCode', () => {
    interface TestCase {
        name: string;
        domain: string;
        phoneNumber: string;
        giftCardCode: string;
        orderAmount: number;
        is_applicable: boolean;
        is_fealtyx_discount_code: boolean;
        reason: Reason | null;
    }

    const tests: TestCase[] = [
        {
            name: "invalid fealtyx code, first 2 of last 4 characters don't match last 2",
            domain: "example.com",
            phoneNumber: "+918989898989",
            giftCardCode: "FLX1234ABCD",
            orderAmount: 100.0,
            is_applicable: true,
            is_fealtyx_discount_code: false,
            reason: null
        },
        {
            name: "invalid fealtyx code - missing prefix",
            domain: "example.com",
            phoneNumber: "+918989898989",
            giftCardCode: "123415EG",
            orderAmount: 100.0,
            is_applicable: true,
            is_fealtyx_discount_code: false,
            reason: null
        },
        {
            name: "invalid fealtyx code - short code",
            domain: "example.com",
            phoneNumber: "+918989898989",
            giftCardCode: "FL1",
            orderAmount: 100.0,
            is_applicable: true,
            is_fealtyx_discount_code: false,
            reason: null
        },
        {
            name: "valid fealtyx code - domain mismatch",
            domain: "example2.com",
            phoneNumber: "+918989898989",
            giftCardCode: "FLX123415EG",
            orderAmount: 100.0,
            is_applicable: false,
            is_fealtyx_discount_code: true,
            reason: Reason.VoucherNotEligible
        },
        {
            name: "valid fealtyx code - phone mismatch",
            domain: "example.com",
            phoneNumber: "777777",
            giftCardCode: "FLX123415EG",
            orderAmount: 100.0,
            is_applicable: false,
            is_fealtyx_discount_code: true,
            reason: Reason.VoucherNotEligible
        },
        {
            name: "valid fealtyx code with FLX prefix",
            domain: "example.com",
            phoneNumber: "+918989898989",
            giftCardCode: "FLX123415EG",
            orderAmount: 100.0,
            is_applicable: true,
            is_fealtyx_discount_code: true,
            reason: null
        },
        {
            name: "valid fealtyx code with UNQ prefix",
            domain: "example.com",
            phoneNumber: "+918989898989",
            giftCardCode: "UNQ123415EG",
            orderAmount: 100.0,
            is_applicable: true,
            is_fealtyx_discount_code: true,
            reason: null
        },
        {
            name: "valid fealtyx code with hashed phone",
            domain: "example.com",
            phoneNumber: getSHA256Hash("+918989898989"),
            giftCardCode: "FLX123415EG",
            orderAmount: 100.0,
            is_applicable: true,
            is_fealtyx_discount_code: true,
            reason: null
        },
        {
            name: "valid fealtyx code with non hashed phone",
            domain: "example.com",
            phoneNumber: "+918989898989",
            giftCardCode: "FLX123415EG",
            orderAmount: 100.0,
            is_applicable: true,
            is_fealtyx_discount_code: true,
            reason: null
        },
        {
            name: "valid fealtyx code with hashed phone but no order amount",
            domain: "example.com",
            phoneNumber: getSHA256Hash("+918989898989"),
            giftCardCode: "FLX123415EG",
            orderAmount: 0,
            is_applicable: true,
            is_fealtyx_discount_code: true,
            reason: null
        },
        {
            name: "valid fealtyx code with hashed phone but empty domain",
            domain: "",
            phoneNumber: getSHA256Hash("+918989898989"),
            giftCardCode: "FLX123415EG",
            orderAmount: 100.0,
            is_applicable: false,
            is_fealtyx_discount_code: true,
            reason: Reason.InvalidDomain
        },
        {
            name: "valid fealtyx code with hashed phone but invalid domain",
            domain: "example\x00.com",
            phoneNumber: getSHA256Hash("+918989898989"),
            giftCardCode: "FLX123415EG",
            orderAmount: 100.0,
            is_applicable: false,
            is_fealtyx_discount_code: true,
            reason: Reason.InvalidDomain
        },
        {
            name: "non-fealtyx code",
            domain: "example.com",
            phoneNumber: "+918989898989",
            giftCardCode: "ABCD1234EFGH",
            orderAmount: 100.0,
            is_applicable: true,
            is_fealtyx_discount_code: false,
            reason: null
        },
    ];

    tests.forEach(testCase => {
        it(testCase.name, () => {
            const result = validateUnloqDiscountCode(
                testCase.domain,
                testCase.phoneNumber,
                testCase.giftCardCode,
                testCase.orderAmount
            );
            
            expect(result.is_applicable).toBe(testCase.is_applicable);
            expect(result.is_fealtyx_discount_code).toBe(testCase.is_fealtyx_discount_code);
            
            // Handle both string and Reason enum comparison
            if (testCase.reason === null) {
                expect(result.reason).toBeNull();
            } else {
                expect(result.reason).toBe(testCase.reason);
            }
        });
    });
});