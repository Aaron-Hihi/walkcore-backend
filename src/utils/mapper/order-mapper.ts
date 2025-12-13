import { OrderCreateRequest } from "../../models/order-model";

export function mapOrderCreateRequestToPrisma(data: OrderCreateRequest) {
    return {
        customer_id: data.customerId,
        restaurant_id: data.restaurantId,
        item_quantity: data.itemQuantity,
    };
}