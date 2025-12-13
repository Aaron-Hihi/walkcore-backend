import { Order } from "../../generated/prisma/client"
import { CustomerResponse, toCustomerResponse } from "./customer-model";
import { RestaurantResponse, toRestaurantResponse } from "./restaurant-model";

export interface OrderResponse {
    id: number;
    customer: CustomerResponse;
    restaurant: RestaurantResponse;
    itemQuantity: number;
    timeOrdered: Date;
    estimatedTimeArrival: Date;
}

export function toOrderResponse(order: Order & { customer: any; restaurant: any; estimatedTimeArrival: Date }): OrderResponse {
    return {
        id: order.id,
        customer: toCustomerResponse(order.customer),
        restaurant: toRestaurantResponse(order.restaurant),
        itemQuantity: order.item_quantity,
        timeOrdered: order.time_ordered,
        estimatedTimeArrival: order.estimatedTimeArrival
    };
}

export function toOrderResponseList(orders: (Order & { customer: any; restaurant: any; estimatedTimeArrival: Date })[]): OrderResponse[] {
    return orders.map(toOrderResponse);
}

export interface OrderCreateRequest {
    customerId: number;
    restaurantId: number;
    itemQuantity: number;
}