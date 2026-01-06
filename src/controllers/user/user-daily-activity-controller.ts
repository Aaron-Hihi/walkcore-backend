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

            //! If I have time I'll change this implementation
            const targetDate: Date = validatedActivity.date as unknown as Date;

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
            
            //! If I have time I'll change this implementation
            const startDate: Date = validatedActivityRange.from as unknown as Date;
            const endDate: Date = validatedActivityRange.to as unknown as Date;
            
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
}
