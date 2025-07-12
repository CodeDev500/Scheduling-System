import express from "express";
import * as UserController from "../controllers/user.controller";

const router = express.Router();

router.get("/id/:id", UserController.getUserById);

export default router;
