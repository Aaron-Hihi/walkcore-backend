import { Request, Response } from "express";
import { CustomerService } from "../services/customer-service";
import { CustomerValidation } from "../validations/customer-validation";
import { toCustomerResponse, toCustomerResponseList } from "../models/customer-model";

export class CustomerController {

    // Create new customer
    static async create(req: Request, res: Response) {
        const data = CustomerValidation.CREATE.parse(req.body);
        const customer = await CustomerService.create(data);

        return res.status(201).json(toCustomerResponse(customer));
    }

    // Get one customer
    static async getOne(req: Request, res: Response) {
        const id = CustomerValidation.ID.parse(req.params.id);
        const customer = await CustomerService.getById(id);

        return res.json(toCustomerResponse(customer));
    }

    // Get all customer
    static async getAll(req: Request, res: Response) {
        const customers = await CustomerService.getAll();

        return res.json(toCustomerResponseList(customers));
    }

    // Update one customer
    static async update(req: Request, res: Response) {
        const id = CustomerValidation.ID.parse(req.params.id);
        const data = CustomerValidation.UPDATE.parse(req.body);

        const updated = await CustomerService.update(id, data);

        return res.json(toCustomerResponse(updated));
    }

    // Delete one customer
    static async delete(req: Request, res: Response) {
        const id = CustomerValidation.ID.parse(req.params.id);
        await CustomerService.delete(id);

        return res.status(204).send();
    }
}