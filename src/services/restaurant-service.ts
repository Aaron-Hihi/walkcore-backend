import { RestaurantCreateRequest, RestaurantUpdateRequest } from "../models/restaurant-model";
import { ResponseError } from "../error/response-error";
import { prismaClient } from "../utils/database-util";
import { mapRestaurantCreateRequestToPrisma, mapRestaurantUpdateRequestToPrisma } from "../utils/mapper/restaurant-mapper";

export class RestaurantService {

    // Create restaurant
    static async create(data: RestaurantCreateRequest) {
        const mapped = mapRestaurantCreateRequestToPrisma(data)
        
        return prismaClient.restaurant.create({data: mapped});
    }


    // Get all restaurants in DB, with status filtering
    static async getAll(status?: string) {
        let where = {};
        
        if (status === "open") {
            where = { is_open: true };
        } else if (status === "closed") {
            where = { is_open: false };
        }

        return prismaClient.restaurant.findMany({ where, orderBy: {id: "asc"} });
    }


    // Get a restaurant based on ID
    static async getById(id: number) {

        // Check if restaurant exists
        const restaurant = await prismaClient.restaurant.findUnique({ where: {id} })
        if (!restaurant) throw new ResponseError(404, "Restaurant not found");
        
        return restaurant
    }


    // Update a restaurant based on ID
    static async update(id: number, data: RestaurantUpdateRequest) {
        await this.getById(id);

        const mapped = mapRestaurantUpdateRequestToPrisma(data);

        return prismaClient.restaurant.update({
            where: { id },
            data: mapped,
        });
    }

    // Delete a restaurant based on ID
    static async delete(id: number)  {
        await this.getById(id)
        return prismaClient.restaurant.delete({ where: {id} })
    }
}
