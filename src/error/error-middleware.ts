import { Request, Response, NextFunction } from "express"
import { ZodError } from "zod"
import { ResponseError } from "../error/response-error"

export const errorMiddleware = async (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {

    // Zod validation error
    if (error instanceof ZodError) {
        res.status(400).json({
            error: error.issues[0].message,
        })
    
    // Response error
    } else if (error instanceof ResponseError) {
        res.status(error.status).json({
            error: error.message,
        })

    // Unknown error
    } else {
        res.status(500).json({
            error: error.message,
        })
    }
}