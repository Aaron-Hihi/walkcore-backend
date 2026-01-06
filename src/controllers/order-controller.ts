import { Request, Response } from "express";
import { OrderValidation } from "../validations/order-validation";
import { OrderService } from "../services/order-service";
import { toOrderResponse, toOrderResponseList } from "../models/order-model";

export class OrderController {

    // Create new order
    static async create(req: Request, res: Response) {
        const data = OrderValidation.CREATE.parse(req.body);
        const order = await OrderService.create(data);

        return res.status(201).json(toOrderResponse(order));
    }

    // Get one order
    static async getOne(req: Request, res: Response) {
        const id = OrderValidation.ID.parse(req.params.id)
        const order = await OrderService.getById(id);

        return res.json(toOrderResponse(order));
    }

    // Get all order
    static async getAll(req: Request, res: Response) {
        const customerId = req.query.customerId ? Number(req.query.customerId) : undefined;
        const restaurantId = req.query.restaurantId ? Number(req.query.restaurantId) : undefined;

        const validatedOrder = OrderValidation.GET_PARAM.parse({ customerId, restaurantId });

        const orders = await OrderService.getAll(validatedOrder.customerId, validatedOrder.restaurantId);

        return res.json(toOrderResponseList(orders));
    }
}