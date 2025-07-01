import * as UserService from "../services/user.service";
import { Request, Response } from "express";
import { loginSchema, registerUserSchema } from "../schema/user.schema";
import fs from "fs";
import { hashPassword, comparePassword } from "../utils/bcryptHandler";
import { setTokens } from "../utils/jwtHandler";
import { statusList } from "../constants/constants";
import { User } from "@prisma/client";
import { sendOTPController } from "./otp.controller";

export const register = async (req: Request, res: Response) => {
  try {
    const parseResult = registerUserSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const userRequest = parseResult.data;

    const userExists = await UserService.getUserByEmail(userRequest.email);

    if (userExists) {
      res.status(409).json({ message: "User already exists" });
      return;
    } else {
      await UserService.deleteUserByEmail(userRequest.email);
    }

    let newFilename: null | string = null;
    if (req.file) {
      let filetype: string = req.file.mimetype.split("/")[1];
      newFilename = req.file.filename + "." + filetype;

      fs.renameSync(
        `./uploads/${req.file.filename}`,
        `./uploads/${newFilename}`
      );
      userRequest.image = newFilename;
    }

    if (userRequest.password) {
      userRequest.password = await hashPassword(userRequest.password);
    }

    const user = await UserService.createUser(userRequest as User);

    if (userRequest.status === statusList.PENDING) {
      await sendOTPController(userRequest.email);
      res.status(200).json({
        message: `Verification OTP sent to ${userRequest.email}`,
      });
      return;
    }

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const userRequest = parsed.data;

    const user = await UserService.getUserByEmail(userRequest.email);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.status === statusList.VERIFIED) {
      res.status(401).json({ message: "Please wait for admin approval" });
      return;
    }

    const isMatch = await comparePassword(userRequest.password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const accessToken = setTokens(res, user);

    res.status(200).json({
      message: "Login successfully",
      user,
      accessToken,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
