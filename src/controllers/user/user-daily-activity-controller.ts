import { Response, NextFunction } from "express";
import { UserRequest } from "../../models/user/user-request-model";
import { userDailyActivityService } from "../../services/user/user-daily-activity";
import { ActivityValidation } from "../../validations/user/activity-validation";
import { Validation } from "../../validations/validation";

// Controller for handling daily user activities
export class ActivityController {

    // Get activity for a specific date
    static async getActivityOn(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const val = Validation.validate(ActivityValidation.GET_SINGLE_DATE, req.query);
            const date = new Date(val.date as unknown as Date);
            date.setUTCHours(0, 0, 0, 0);
            const result = await userDailyActivityService.getActivityOn(BigInt(req.user!.id), date);
            res.status(200).json({ data: result });
        } catch (e) { next(e); }
    }

    // Get activities within a date range
    static async getActivityOnRange(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const val = Validation.validate(ActivityValidation.GET_DATE_RANGE, req.query);
            const start = new Date(val.from as unknown as Date);
            const end = new Date(val.to as unknown as Date);
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(23, 59, 59, 999);
            const result = await userDailyActivityService.getActivitiesRange(BigInt(req.user!.id), start, end);
            res.status(200).json({ data: result });
        } catch (e) { next(e); }
    }

    // Sync steps and return data
    static async syncSteps(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const val = Validation.validate(ActivityValidation.SYNC, req.body);
            const result = await userDailyActivityService.syncSteps(
                req.user!, 
                val.steps, 
                val.date as unknown as Date,
                req.body.calories
            );
            
            return res.status(200).json({
                data: {
                    stepsWalked: result ? Number(result.stepsWalked) : 0,
                    todayTotalSteps: result ? Number(result.stepsWalked) : 0,
                    caloriesBurned: result ? Number(result.caloriesBurned) : 0,
                    distance: result ? Number(result.distance) : 0,
                    date: result?.date
                }
            });
            
        } catch (e) {
            next(e);
        }
    }
}