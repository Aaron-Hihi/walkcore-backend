export function calculateETA(timeOrdered: Date, itemQuantity: number): Date {
    const minutesPerItem = 10;
    const deliveryMinutes = 10;
    const totalMinutes = itemQuantity * minutesPerItem + deliveryMinutes;
    return new Date(timeOrdered.getTime() + totalMinutes * 60 * 1000);
}