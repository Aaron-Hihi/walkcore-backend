import { Request, Response } from "express";
import { RestaurantValidation } from "../validations/restaurant-validation";
import { RestaurantService } from "../services/restaurant-service";
import { toRestaurantResponse, toRestaurantResponseList } from "../models/restaurant-model";

export class RestaurantController {

    // Create new restaurant
    static async create(req: Request, res: Response) {
        const data = RestaurantValidation.CREATE.parse(req.body);
        const restaurant = await RestaurantService.create(data);

        return res.status(201).json(toRestaurantResponse(restaurant));
    }

    // Get one restaurant
    static async getOne(req: Request, res: Response) {
        const id = RestaurantValidation.ID.parse(req.params.id);
        const restaurant = await RestaurantService.getById(id);

        return res.json(toRestaurantResponse(restaurant));
    }

    // Get all restaurants
    static async getAll(req: Request, res: Response) {
        const status = req.query.status as string | undefined;
        //          -> either open, close, or undefined

        const restaurants = await RestaurantService.getAll(status);

        return res.json(toRestaurantResponseList(restaurants));
    }

    // Update one restaurant
    static async update(req: Request, res: Response) {
        const id = RestaurantValidation.ID.parse(req.params.id);
        const data = RestaurantValidation.UPDATE.parse(req.body);

        const updated = await RestaurantService.update(id, data);

        return res.json(toRestaurantResponse(updated));
    }

    // Delete one restaurant
    static async delete(req: Request, res: Response) {
        const id = RestaurantValidation.ID.parse(req.params.id);
        await RestaurantService.delete(id);

        return res.status(204).send();
    }
}