import { z, ZodType } from "zod";

export class UserAchievementValidation {
  static readonly CREATE_UPDATE: ZodType = z.object({
    isCompleted: z
      .boolean({ message: "isCompleted must be a boolean value!" }),

    completedAt: z
      .union([
        z.string().datetime({ message: "completedAt must be a valid ISO date string!" }),
        z.null()
      ])
      .optional(),

   
  });
}
