import { ResponseError } from "../error/response-error";

export class ValidationUtil {
    static toBigInt(value: string, fieldName: string): bigint {
        try {
            return BigInt(value);
        } catch (e) {
            throw new ResponseError(400, `Invalid ID format for ${fieldName}. Must be a valid number.`);
        }
    }
}