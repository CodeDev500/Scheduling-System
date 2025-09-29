import express from "express";
import * as UserController from "../controllers/user.controller";

const router = express.Router();

router.get("/id/:id", UserController.getUserById);
router.get("/faculty", UserController.getAllFaculty);
router.get("/faculty/department/:department", UserController.getFacultyByDepartment);
router.get("/instructor", UserController.getInstructor);

export default router;
