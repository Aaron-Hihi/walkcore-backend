import { Request, Response, NextFunction } from "express";
import { UserRequest } from "../../models/user/user-request-model";
import { ResponseError } from "../../error/response-error";
import { userDailyActivityService } from "../../services/user/user-daily-activity";
import { ActivityValidation } from "../../validations/user/activity-validation";
import { Validation } from "../../validations/validation";

export class ActivityController {

    //* === Get user daily activity
    static async getActivityOn(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const currentUserId = BigInt(req.user!.id);
            const validatedActivity = Validation.validate(
                ActivityValidation.GET_SINGLE_DATE,
                req.query
            );

            const targetDate = new Date(validatedActivity.date as string);
            targetDate.setUTCHours(0, 0, 0, 0);

            const activity = await userDailyActivityService.getActivityOn(
                currentUserId,
                targetDate
            );

            res.status(200).json({ data: activity });

        } catch (error) {
            next(error);
        }
    }


    // Get all activities on date range
    static async getActivityOnRange(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const currentUserId = BigInt(req.user!.id);
            
            // Validation
            const validatedActivityRange = Validation.validate(
                ActivityValidation.GET_DATE_RANGE,
                req.query
            );
            
            const startDate = new Date(validatedActivityRange.from as string);
            startDate.setUTCHours(0, 0, 0, 0);
            
            const endDate = new Date(validatedActivityRange.to as string);
            endDate.setUTCHours(23, 59, 59, 999);

            const activities = await userDailyActivityService.getActivitiesRange(
                currentUserId,
                startDate,
                endDate
            );

            res.status(200).json({ data: activities });

        } catch (error) {
            next(error);
        }
    }

    static async syncSteps(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const steps = req.body.steps;
            if (typeof steps !== 'number' || steps < 0) {
                res.status(400).json({ errors: "Steps must be a positive number" });
                return;
            }

            const result = await userDailyActivityService.syncSteps(req.user!, steps);
            
            res.status(200).json({
                message: "Steps synchronized successfully",
                data: {
                    date: result.date,
                    todayTotalSteps: result.stepsWalked
                }
            });
        } catch (e) {
            next(e);
        }
    }
}
