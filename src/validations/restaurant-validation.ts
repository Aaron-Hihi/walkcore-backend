import { z } from "zod";

export class RestaurantValidation {
    
    static readonly BASE = z.object({
        name: z
            .string({ message: "Name must be a string!" })
            .min(1, { message: "Name cannot be empty" })
            .max(100, { message: "Name cannot exceed 100 characters" }),

        description: z
            .string({ message: "Description must be a string!" })
            .min(1, { message: "Description cannot be empty" })
            .max(500, { message: "Description cannot exceed 500 characters" }),
            
        isOpen: z
            .boolean({ message: "isOpen must be a boolean (true/false)" })
            .optional(), 
    });

    static readonly CREATE = RestaurantValidation.BASE.strict();

    static readonly UPDATE = RestaurantValidation.BASE.partial().strict().refine(
        data => Object.keys(data).length > 0,
        { message: "At least one field must be provided" }
    );
    
    static readonly ID = z.coerce.number().int().positive();
}