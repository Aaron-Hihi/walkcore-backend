import { z, ZodType } from "zod";

/* =========================
* SESSION VALIDATION SCHEMAS
========================= */
export class SessionValidation {
    static readonly CREATE: ZodType = z.object({
        title: z.string().min(1).max(100),
        description: z.string().max(255).optional(),
        mode: z.enum(["SOLO", "REMOTE"]),
        visibility: z.enum(["PUBLIC", "FRIENDONLY", "INVITEONLY"]),
        maxParticipants: z.number().int().min(1).max(100),
        stepTarget: z.number().int().min(1),
        startTime: z.coerce.date(),
        endTime: z.coerce.date(),
        startLat: z.number().optional(),
        startLong: z.number().optional(),
    }).refine((data) => data.startTime < data.endTime, {
        message: "Start time must be before end time",
        path: ["startTime"],
    }).refine((data) => data.startTime > new Date(), {
        message: "Start time must be in the future",
        path: ["startTime"],
    });

    static readonly UPDATE: ZodType = z.object({
        title: z.string().min(1).max(100).optional(),
        description: z.string().max(255).optional(),
        status: z.enum(["PLANNED", "ONGOING", "FINISHED", "CANCELLED"]).optional(),
        visibility: z.enum(["PUBLIC", "FRIENDONLY", "INVITEONLY"]).optional(),
    });
}