import jwt from "jsonwebtoken";
import { Response } from "express";
import { User } from "@prisma/client";
require("dotenv").config();

type TPayload = { user: User };

export const generateToken = (payload: TPayload): string => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN!, { expiresIn: "1d" });
};

export const generateRefreshToken = (payload: TPayload): string => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN!, { expiresIn: "1d" });
};

export const setTokens = (res: Response, user: User): string => {
  const accessToken = generateToken({ user });
  const refreshToken = generateRefreshToken({ user });

  res.cookie("accessToken", accessToken, {
    // httpOnly: true,
    maxAge: 26 * 60 * 60 * 1000, // 1 day in milliseconds
    // secure: true,
    // sameSite: "none",
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    // sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  });

  return accessToken;
};
