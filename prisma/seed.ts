import "dotenv/config"
import { prismaClient } from "../src/utils/database-util";

async function main() {
//     // Customers
//     const customer1 = await prismaClient.customer.create({
//         data: { name: "Aaron Hans", phone: "081234567890" }
//     });
//     const customer2 = await prismaClient.customer.create({
//         data: { name: "Jermy Eklesia", phone: "082345678901" }
//     });
//     const customer3 = await prismaClient.customer.create({
//         data: { name: "Felix Richardo", phone: "083456789012" }
//     });


//     // Restaurants
//     const restaurant1 = await prismaClient.restaurant.create({
//         data: { name: "Pizza Hut", description: "Pizza enak" }
//     });
//     const restaurant2 = await prismaClient.restaurant.create({
//         data: { name: "Sushi Tei", description: "Sushi enak" }
//     });
//     const restaurant3 = await prismaClient.restaurant.create({
//         data: { name: "Burger King", description: "Burger enak" }
//     });

//     // Orders
//     await prismaClient.order.createMany({
//         data: [
//         {
//             customer_id: customer1.id,
//             restaurant_id: restaurant1.id,
//             item_quantity: 2,
//         },
//         {
//             customer_id: customer1.id,
//             restaurant_id: restaurant2.id,
//             item_quantity: 1,
//         },
//         {
//             customer_id: customer2.id,
//             restaurant_id: restaurant2.id,
//             item_quantity: 3,
//         },
//         {
//             customer_id: customer2.id,
//             restaurant_id: restaurant3.id,
//             item_quantity: 2,
//         },
//         {
//             customer_id: customer3.id,
//             restaurant_id: restaurant1.id,
//             item_quantity: 4,
//         },
//         ],
//     });

//     // Shop_item
//     const item1 = await prismaClient.shop_Item.create({
//         data: {name: "Cat With Beanie", description: "Just a cat wearing a hat", price: 5, imageUrl: "-", itemType: "AVATAR"}
//     });

// }

// main()
//     .catch(e => {
//         console.error(e);
//         process.exit(1);
//     })
//     .finally(() => prismaClient.$disconnect());
}