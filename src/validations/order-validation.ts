import { z, ZodType } from "zod";

export class OrderValidation {
    
    static readonly BASE = z.object({
        
        customerId: z
            .number({ message: "customerId must be a number" })
            .int({ message: "customerId must be an integer" })
            .positive({ message: "customerId must be a positive ID" }),
            
        restaurantId: z
            .number({ message: "restaurantId must be a number" })
            .int({ message: "restaurantId must be an integer" })
            .positive({ message: "restaurantId must be a positive ID" }),
            
        itemQuantity: z
            .number({ message: "itemQuantity must be a number" })
            .int({ message: "itemQuantity must be an integer" })
            .min(1, { message: "Item quantity must be at least 1" })
            .max(100, { message: "Item quantity is too high" }), 

    });

    static readonly CREATE = OrderValidation.BASE.strict();

    static readonly UPDATE = OrderValidation.BASE.partial().strict().refine(
        data => Object.keys(data).length > 0,
        { message: "At least one field must be provided" }
    );

    static readonly ID = z.coerce.number().int().positive();
    
    static readonly GET_PARAM = z.object({
        customerId: z.coerce.number().int().positive().optional(),
        restaurantId: z.coerce.number().int().positive().optional(),
        
    }).strict();
}