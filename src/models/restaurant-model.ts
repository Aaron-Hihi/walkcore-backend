import { Restaurant } from "../../generated/prisma/client"

export interface RestaurantResponse {
    id: number
    name: string,
    description: string,
    isOpen: boolean
}

export function toRestaurantResponse(restaurant: Restaurant): RestaurantResponse {
    return {
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        isOpen: restaurant.is_open
    }
}

export function toRestaurantResponseList(restaurants: Restaurant[]): RestaurantResponse[] {
    return restaurants.map(toRestaurantResponse)
}

export interface RestaurantCreateRequest {
    name: string
    description: string
    isOpen?: boolean
}

export interface RestaurantUpdateRequest {
    name?: string
    description?: string
    isOpen?: boolean
}