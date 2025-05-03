import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "FATAL ERROR: JWT_SECRET environment variable is not defined."
  );
}

interface JwtPayload {
  userId: string;
}

export function generateToken(
  userId: string,
  expiresIn: number = 86400
): string {
  const payload: JwtPayload = { userId };
  return jwt.sign(payload, JWT_SECRET!, { expiresIn });
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET!) as JwtPayload;
  } catch (error) {
    console.error("JWT Verification Error:", error);
    throw new Error("Invalid or expire token.");
  }
}
