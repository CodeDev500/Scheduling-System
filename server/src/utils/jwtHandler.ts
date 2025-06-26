import jwt from "jsonwebtoken";

type TPayload = { id: string };

export const generateToken = (payload: TPayload): string => {
  return jwt.sign(payload, process.env.SECRET_KEY!, { expiresIn: "1d" }); // 1 day
};

export const verifyToken = (token: string): TPayload => {
  return jwt.verify(token, process.env.SECRET_KEY!) as TPayload;
};
