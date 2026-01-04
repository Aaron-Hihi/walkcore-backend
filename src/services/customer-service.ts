import { CustomerCreateRequest, CustomerUpdateRequest } from "../models/customer-model";
import { ResponseError } from "../error/response-error";
import { prismaClient } from "../utils/database-util";

export class CustomerService {

    // Create customer
    static async create(data: CustomerCreateRequest) {
        return prismaClient.customer.create({data});
    }

    // Get all customers in DB
    static async getAll() {
        return prismaClient.customer.findMany({ orderBy: {id: "asc"} });
    }

    // Get a customer based on ID
    static async getById(id: number) {

        // Check if customer exists
        const customer = await prismaClient.customer.findUnique({ where: {id} })
        if (!customer) throw new ResponseError(404, "Customer not found");

        return customer
    }

    // Update a customer based on ID
    static async update(id: number, data: CustomerUpdateRequest) {
        await this.getById(id);
        return prismaClient.customer.update({
            where: { id },
            data,
        });
    }

    // Delete a customer based on ID
    static async delete(id: number)  {
        await this.getById(id)
        return prismaClient.customer.delete({ where: {id} })
    }
}
