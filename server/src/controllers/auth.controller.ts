import * as UserService from "../services/user.service";
import { Request, Response } from "express";
import { User } from "../schema/user.schema";

export const register = async (req: Request, res: Response) => {
  try {
    const userRequest: User = req.body;
    const user = await UserService.createUser(userRequest);

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
