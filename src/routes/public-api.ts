import express from 'express'

import { asyncHandler } from "../utils/async-handler";
import { CustomerController } from '../controllers/customer-controller'
import { RestaurantController } from '../controllers/restaurant-controller'
import { OrderController } from '../controllers/order-controller'

export const publicRouter = express.Router()

// --- CUSTOMER ---
// 1. Create new customer
publicRouter.post("/customers", asyncHandler(CustomerController.create))

// 2.1. Display customer info all
publicRouter.get("/customers", asyncHandler(CustomerController.getAll))

// 2.2. Display customer info
publicRouter.get("/customers/:id", asyncHandler(CustomerController.getOne))

// 3. Update customer info
publicRouter.patch("/customers/:id", asyncHandler(CustomerController.update))

// 4. Delete customer
publicRouter.delete("/customers/:id", asyncHandler(CustomerController.delete))


// --- RESTAURANT ---
// 1. Create Restaurant 
publicRouter.post("/restaurants", asyncHandler(RestaurantController.create))

// 2. Display Restaurants
publicRouter.get("/restaurants", asyncHandler(RestaurantController.getAll))
// /restaurants = unfiltered
// /restaurants?status=open
// /restaurants?status=closed

// 2a. Display 1 restaurant
publicRouter.get("/restaurants/:id", asyncHandler(RestaurantController.getOne))

// 3. Update restaurant info
publicRouter.patch("/restaurants/:id", asyncHandler(RestaurantController.update))

// 4. Delete restaurant
publicRouter.delete("/restaurants/:id", asyncHandler(RestaurantController.delete))


// --- ORDERS ---
// 1. Create new order
publicRouter.post("/orders", asyncHandler(OrderController.create))

// 2. Display one order
publicRouter.get("/orders/:id", asyncHandler(OrderController.getOne))

// 3. Display filtered order
publicRouter.get("/orders", asyncHandler(OrderController.getAll))
// /orders?customerId=:id
// /orders?restaurantId="id