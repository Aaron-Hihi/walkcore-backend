import { z, ZodType } from "zod";

export class SessionValidation {
    static readonly CREATE: ZodType = z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        mode: z.enum(["SOLO", "REMOTE"]),
        visibility: z.enum(["PUBLIC", "FRIENDONLY", "INVITEONLY"]),
        maxParticipants: z.number().int().positive(),
        stepTarget: z.number().int().positive(),
        startTime: z.coerce.date(),
        endTime: z.coerce.date(),
        startLat: z.number().optional(),
        startLong: z.number().optional()
    }).refine((data) => data.endTime > data.startTime, {
        message: "End time must be after start time",
        path: ["endTime"]
    });

    static readonly UPDATE: ZodType = z.object({
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        mode: z.enum(["SOLO", "REMOTE"]).optional(),
        visibility: z.enum(["PUBLIC", "FRIENDONLY", "INVITEONLY"]).optional(),
        maxParticipants: z.number().int().positive().optional(),
        stepTarget: z.number().int().positive().optional(),
        startTime: z.coerce.date().optional(),
        endTime: z.coerce.date().optional(),
        status: z.enum(["PLANNED", "ONGOING", "FINISHED", "CANCELLED"]).optional()
    });

    static readonly JOIN: ZodType = z.object({
        sessionId: z.coerce.string().transform((val) => BigInt(val))
    });
}