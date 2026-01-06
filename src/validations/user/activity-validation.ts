/* =========================
* ACTIVITY VALIDATION REVISION
========================= */
import { z, ZodType } from "zod";

const dateStringSchema = z
    .string({
        message: "Date field must be a string."
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Date must be in YYYY-MM-DD format."
    })
    .pipe(z.coerce.date({
        error: "Date provided is not a valid calendar date."
    }));

export class ActivityValidation {
    static readonly GET_SINGLE_DATE: ZodType = z.object({
        date: dateStringSchema
            .describe("The target date for activity lookup (YYYY-MM-DD).")
    });

    static readonly GET_DATE_RANGE: ZodType = z.object({
        from: dateStringSchema
            .describe("The start date of the activity range (YYYY-MM-DD)."),
        
        to: dateStringSchema
            .describe("The end date of the activity range (YYYY-MM-DD)."),
    })
    .refine(
        (data) => {
            return data.from.getTime() <= data.to.getTime();
        },
        {
            message: "Start date ('from') cannot be after end date ('to').",
            path: ["from"],
        }
    );
}