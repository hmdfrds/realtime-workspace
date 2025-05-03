import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  try {
    const payload = verifyToken(token);

    req.user = { id: payload.userId };

    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    res
      .status(403)
      .json({ message: "Access denied. Invalid or expired token" });
  }
}
