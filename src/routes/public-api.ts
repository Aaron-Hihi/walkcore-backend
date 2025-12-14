import express from 'express'
import { UserController } from '../controllers/user-controller';

export const publicRouter = express.Router()

//* === AUTH ===
// Register
publicRouter.post("/register", UserController.register);

// Login
publicRouter.post("/login", UserController.login);

