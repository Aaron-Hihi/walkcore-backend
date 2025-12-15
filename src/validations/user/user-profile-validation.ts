import { z, ZodType } from "zod"

export class UserProfileValidation {
    static readonly UPDATE_PROFILE: ZodType = z.object({
        height: z
            .number({
                error: "Height must be a number!"
            })
            .positive({
                error: "Height must be greater than 0!"
            })
            .max(1000, { 
                error: "Height value is too large." 
            })
            .optional(),
        
        weight: z
            .number({
                error: "Weight must be a number!"
            })
            .positive({
                error: "Weight must be greater than 0!"
            })
            .max(1000, { 
                error: "Weight value is too large." 
            })
            .optional(),

        dateOfBirth: z
            .coerce.date({
                error: "Invalid date of birth format!"
            })
            .optional(),
        
        gender: z
            .enum(["MALE", "FEMALE"], {
                error: "Invalid gender! Options are: MALE or FEMALE."
            })
            .optional(),
    })
    .refine(
        (data) => Object.keys(data).length > 0,
        {
            error: "At least one field must be updated",
        }
    )
}