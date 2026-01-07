import express from "express"
import { PORT } from "./utils/env-util"
import { publicRouter } from "./routes/public-api"
import { errorMiddleware } from "./error/error-middleware"
import { privateRouter } from "./routes/private-api"

export const app = express()

// Init
app.use(express.json())

// Calling backend
app.use("/walkcore-backend", publicRouter)
app.use("/walkcore-backend", privateRouter)

// Error handling
app.use(errorMiddleware)

if (process.env.NODE_ENV !== 'test') {
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}





