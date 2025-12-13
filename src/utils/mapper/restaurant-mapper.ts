import { RestaurantCreateRequest, RestaurantUpdateRequest } from "../../models/restaurant-model";

export function mapRestaurantCreateRequestToPrisma(data: RestaurantCreateRequest) {
    return {
        name: data.name,
        description: data.description,
        is_open: data.isOpen
    };
}

export function mapRestaurantUpdateRequestToPrisma(data: RestaurantUpdateRequest) {
    const updateData: {
        name?: string;
        description?: string;
        isOpen?: boolean;
    } = {};

    if (data.name !== undefined) {
        updateData.name = data.name;
    }

    if (data.description !== undefined) {
        updateData.description = data.description;
    }

    if (data.isOpen !== undefined) {
        updateData.isOpen = data.isOpen;
    }

    return updateData;
}