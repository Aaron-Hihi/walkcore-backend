import { z } from "zod";

export class CustomerValidation {
    static readonly BASE = z.object({
        name: z
            .string()
            .min(1, { message: "Name cannot be empty" }),
        phone: z
            .string()
            .min(10, { message: "Phone must have at least 10 digits" })
            .max(14, { message: "Phone number is way too long" })
            .regex(/^[0-9]+$/, { message: "Phone must contain number only" }),
    });

    static readonly CREATE = CustomerValidation.BASE.strict();
    static readonly UPDATE = CustomerValidation.BASE.partial().strict().refine(
        data => Object.keys(data).length > 0,
        { message: "At least one field must be provided" }
    );
    static readonly ID = z.coerce.number().int().positive();
}