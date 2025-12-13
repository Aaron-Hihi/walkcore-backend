import express from "express"
import { PORT } from "./utils/env-util"
import { publicRouter } from "./routes/public-api"
import { errorMiddleware } from "./error/error-middleware"

const app = express()

// Init
app.use(express.json())

// Calling backend
app.use("/restaurant-manager", publicRouter)

// Error handling
app.use(errorMiddleware)

app.listen(PORT || 3000, () => {
    console.log(`Connected to port ${PORT}`)
})





