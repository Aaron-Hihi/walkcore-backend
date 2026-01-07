import { z, ZodType } from "zod";

export class AchievementValidation {
  static readonly CREATE_UPDATE: ZodType = z.object({
    title: z
      .string({ message: "Title must be string!" })
      .min(2, { message: "Title must be at least 2 characters!" })
      .max(100, { message: "Title must not exceed 100 characters!" }),

    description: z
      .string({ message: "Description must be string!" })
      .min(1, { message: "Description can not be empty!" })
      .max(500, { message: "Description must not exceed 500 characters!" }),

    requirementType: z
      .string({ message: "Requirement type must be string!" })
      .refine(
        (val) =>
          val === "TOTAL_STEPS" ||
          val === "TOTAL_DISTANCE" ||
          val === "TOTAL_CALORIES" ||
          val === "TOTAL_SESSIONS" ||
          val === "LONGEST_STREAK",
        { message: "Requirement type is invalid!" }
      ),
    requirementValue: z
      .number({ message: "Requirement value must be number!" })
      .int({ message: "Requirement value must be an integer!" })
      .positive({ message: "Requirement value must be greater than 0!" }),

    reward: z
      .number({ message: "Reward must be number!" })
      .int({ message: "Reward must be an integer!" })
      .min(0, { message: "Reward can not be negative!" }),
  });
}
