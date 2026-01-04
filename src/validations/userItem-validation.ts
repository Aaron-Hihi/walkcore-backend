import { z, ZodType } from "zod";

export class UserItemValidation {
  static readonly CREATE_UPDATE: ZodType = z.object({
    acquiredAt: z
      .string({ message: "acquiredAt must be a string!" })
      .datetime({ message: "acquiredAt must be a valid ISO date string!" }),

    isEquipped: z
      .boolean({ message: "isEquipped must be a boolean value!" }),

    userId: z
      .number({ message: "userId must be a number!" })
      .int({ message: "userId must be an integer!" })
      .positive({ message: "userId must be greater than 0!" }),

    shopId: z
      .number({ message: "shopId must be a number!" })
      .int({ message: "shopId must be an integer!" })
      .positive({ message: "shopId must be greater than 0!" }),
  });
}
