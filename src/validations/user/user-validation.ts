import { z, ZodType } from "zod"

export class UserValidation {
    // Schema for user registration
    static readonly REGISTER: ZodType = z.object({
        username: z
            .string({
                message: "Username must be string!",
            })
            .min(1, {
                message: "Username can not be empty!",
            }),
        email: z
            .email({
                message: "Email format is invalid!",
            })
            .min(1, {
                message: "Email can not be empty!",
            }),
        password: z
            .string({
                message: "Password must be string!",
            })
            .min(8, {
                message: "Password must contain more than or equal to 8 characters!",
            }),
        confirmPassword: z
            .string({
                message: "Password must be string!",
            })
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Password and confirm password do not match",
        path: ["confirmPassword"],
    })

    // Schema for user login
    static readonly LOGIN: ZodType = z.object({
        email: z
            .email({
                message: "Email format is invalid!",
            })
            .min(1, {
                message: "Email can not be empty!",
            }),
        password: z
            .string({
                message: "Password must be string!",
            })
            .min(8, {
                message: "Password must contain more than or equal to 8 characters!",
            }),
    })

    static readonly UPDATE_PROFILE: ZodType = z.object({
        username: z
            .string({
                message: "Username must be string!",
            })
            .min(3, {
                message: "Username must contain at least 3 characters!",
            })
            .max(100)
            .optional(),
        gender: z
            .enum(["MALE", "FEMALE"], {
                message: "Gender must be either MALE or FEMALE!",
            })
            .optional(),
        dateOfBirth: z.coerce
            .date({
                message: "Invalid date format!",
            })
            .optional(),
        height: z
            .number({
                message: "Height must be a number!",
            })
            .positive({
                message: "Height must be a positive number!",
            })
            .min(50, {
                message: "Height is too short!",
            })
            .max(300, {
                message: "Height is too tall!",
            })
            .optional(),
        weight: z
            .number({
                message: "Weight must be a number!",
            })
            .positive({
                message: "Weight must be a positive number!",
            })
            .min(20, {
                message: "Weight is too light!",
            })
            .max(500, {
                message: "Weight is too heavy!",
            })
            .optional()
    })
}