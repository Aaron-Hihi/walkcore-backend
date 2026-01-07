import { z, ZodType } from "zod";

const dateStringSchema = z
    .string({
        message: "Date field must be a string."
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Date must be in YYYY-MM-DD format."
    })
    .transform((val) => {
        const date = new Date(val);
        if (isNaN(date.getTime())) {
            throw new Error("Invalid calendar date.");
        }
        return date;
    });

export class ActivityValidation {
    static readonly GET_SINGLE_DATE: ZodType = z.object({
        date: dateStringSchema
    });

    static readonly GET_DATE_RANGE: ZodType = z.object({
        from: dateStringSchema,
        to: dateStringSchema,
    })
    .refine(
        (data) => data.from.getTime() <= data.to.getTime(),
        {
            message: "Start date ('from') cannot be after end date ('to').",
            path: ["from"],
        }
    );

    static readonly SYNC: ZodType = z.object({
        steps: z.number().min(0),
        date: z.string().optional().default(() => new Date().toISOString().split('T')[0]).pipe(dateStringSchema)
    });
}