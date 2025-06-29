import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
require("dotenv").config();

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      res.json({ message: "Unauthorized" });
      return;
    }

    const token: string = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN!, (err, decoded) => {
      if (err) {
        res.json({ error: "Unauthorized" });
        return;
      }

      req.user = decoded as JwtPayload; // Now TypeScript will not complain
      next();
    });
  } catch (error: any) {
    res.status(401).json({
      message: "Unauthorized",
    });
  }
};
