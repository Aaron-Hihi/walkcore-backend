import { Customer } from "../../generated/prisma/client"

export interface CustomerResponse {
    id: number
    name: string, 
    phone: string
}

export function toCustomerResponse(customer: Customer): CustomerResponse {
    return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone
    }
}

export function toCustomerResponseList(customers: Customer[]): CustomerResponse[] {
    return customers.map(toCustomerResponse)
}

export interface CustomerCreateRequest {
    name: string
    phone: string
}

export interface CustomerUpdateRequest {
    name?: string
    phone?: string
}