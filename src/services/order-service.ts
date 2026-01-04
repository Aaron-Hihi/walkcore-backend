import { ResponseError } from "../error/response-error";
import { prismaClient } from "../utils/database-util";
import { OrderCreateRequest } from "../models/order-model";
import { calculateETA } from "../utils/order-util";
import { mapOrderCreateRequestToPrisma } from "../utils/mapper/order-mapper";

export class OrderService {

    // Create order
    static async create(data: OrderCreateRequest) {
        const mapped = mapOrderCreateRequestToPrisma(data)
        const order = await prismaClient.order.create({ data: mapped });

        // Return the entire order object
        return this.getById(order.id)
    }


    // Get all orders in DB
    static async getAll(customerId?: number, restaurantId?: number) {
        const where: any = {};

        // Add where condition if id exists
        if (customerId) where.customer_id = customerId;
        if (restaurantId) where.restaurant_id = restaurantId;

        // Get all orders
        const orders = await prismaClient.order.findMany({
            where,
            include: { 
                customer: true, 
                restaurant: true 
            },
        });

        // Map each order and calculate estimated time of arrival
        return orders.map(order => ({
            ...order,
            estimatedTimeArrival: calculateETA(order.time_ordered, order.item_quantity),
        }));
    }


    // Get a order based on ID
    static async getById(id: number) {

        // Check if order exists
        const order = await prismaClient.order.findUnique({ 
            where: {id},
            include: { 
                customer: true, 
                restaurant: true 
            }
        });
        if (!order) throw new ResponseError(404, "Order not found");

        // Calculate estimated time of arrival
        const eta = calculateETA(order.time_ordered, order.item_quantity)

        return {
            ...order,
            estimatedTimeArrival: eta
        }
    }
}
