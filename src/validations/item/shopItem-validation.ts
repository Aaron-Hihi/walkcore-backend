import { z, ZodType } from "zod";

export class ShopItemValidation {
  static readonly CREATE_UPDATE: ZodType = z.object({
    name: z
      .string({ message: "Name must be string!" })
      .min(2, { message: "Name must be at least 2 characters!" })
      .max(100, { message: "Name must not exceed 100 characters!" }),

    description: z
      .string({ message: "Description must be string!" })
      .min(1, { message: "Description can not be empty!" })
      .max(500, { message: "Description must not exceed 500 characters!" }),

    price: z
      .number({ message: "Price must be number!" })
      .positive({ message: "Price must be greater than 0!" }),

    imageUrl: z
      .string({ message: "Image URL must be string!" })
      .min(1, { message: "Image URL can not be empty!" })
      .url({ message: "Image URL format is invalid!" }),

    itemType: z
      .string({ message: "Item type must be string!" })
      .min(1, { message: "Item type can not be empty!" })
      .refine(
        (val) =>
          val === "AVATAR" ||
          val === "FRAME" ||
          val === "BACKGROUND" ||
          val === "CONSUMABLE",
        {
          message: "Item type is invalid!",
        }
      ),
  });
}
