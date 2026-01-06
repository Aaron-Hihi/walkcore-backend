import { Gender } from "../../generated/prisma/client";

export interface UserBiometrics {
    weight: number;
    height: number;
    dateOfBirth: Date | null;
    gender: Gender | null;
}

export class FitnessUtil {
    // Calculates stride length based on height and gender (returns meters)
    static calculateStrideLength(heightCm: number, gender: Gender | null): number {
        const heightMeters = heightCm / 100;
        if (gender === Gender.FEMALE) {
            return heightMeters * 0.413;
        }
        return heightMeters * 0.415;
    }

    // Calculates calories burned using MET (Metabolic Equivalent of Task) for walking
    static calculateCalories(steps: number, weightKg: number, heightCm: number, gender: Gender | null): number {
        const distanceKm = (steps * this.calculateStrideLength(heightCm, gender)) / 1000;
        const speedKph = 4.8;
        const metValue = 3.5;
        const timeHours = distanceKm / speedKph;
        return Math.round(metValue * 3.5 * weightKg * timeHours / 200);
    }
}