import jwt, { JwtPayload } from "jsonwebtoken";
import ResponseStatus from "../helper/responseStatus";
import config from "../config/config";
import type { NextFunction, Request, Response } from "express";
import { JwtUserInfoType } from "../type/userType";

interface AuthRequest extends Request {
  user?: JwtUserInfoType | JwtPayload;
}

export const authTokenValidator = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("hit authTokenValidator");
  try {
    const authHeaderRaw =
      req.headers.authorization || req.headers.Authorization;
    // console.log("authHeaderRaw : ", authHeaderRaw);
    // Normalize to a string (handles string[] case)
    const authHeader = Array.isArray(authHeaderRaw)
      ? authHeaderRaw[0]
      : authHeaderRaw;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json(ResponseStatus.UNAUTHENTICATED("No token provided"));
    }

    // Extract the token part
    const token = authHeader.split(" ")[1];
    console.log("Token : ", token);
    if (!token) {
      return res.json(ResponseStatus.PERMISSION_DENIED("Invalid token format"));
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecrete || "secret");
    req.user = decoded as JwtUserInfoType;

    // Pass control to the next middleware
    console.log("pass")
    next();
  } catch (error: unknown) {
    const err = error as Error;
    console.log("Error : ", err);
    res.json(ResponseStatus.PERMISSION_DENIED(err.message));
  }
};