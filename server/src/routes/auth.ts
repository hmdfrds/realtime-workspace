import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { generateToken } from "../lib/jwt";

const authRoutes = Router();
const SALT_ROUNDS = 10;

authRoutes.post("/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ message: "Email format is not valid." });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ message: "Email already in use." });
      return;
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    res.status(201).json({
      message: "User created successfully.",
      user: {
        id: newUser.id,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal server error during signup." });
  }
});

authRoutes.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required." });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ message: "Invalid email or passwrod." });
      return;
    }

    const token = generateToken(user.id);

    res.status(200).json({
      message: "Login successful.",
      token: token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error during login." });
  }
});

export default authRoutes;
