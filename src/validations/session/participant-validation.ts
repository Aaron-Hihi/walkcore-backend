import { z, ZodType } from "zod";

/* =========================
* PARTICIPANT VALIDATION
========================= */
export class ParticipantValidation {
    static readonly ADD_STEP: ZodType = z.object({
        steps: z.number().int().positive()
    });
}