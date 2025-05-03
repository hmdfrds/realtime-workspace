import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import authRoutes from "./routes/auth";
import { authenticateToken } from "./middleware/authMiddleware";
import { AddressInfo } from "net";
const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.get("/api/ping", (req: Request, res: Response) => {
  res.json({ message: "pong" });
});

app.use("/api/auth", authRoutes);

app.get(
  "/api/protected-test",
  authenticateToken,
  (req: Request, res: Response) => {
    const userId = req.user?.id;
    res.json({
      message: `Hello user ${userId}! This is a protected route.`,
      user: req.user,
    });
  }
);

const server = http.createServer(app);
const addressInfo = server.address() as AddressInfo;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Auth routes available at http://localhost:${port}/api/auth`);
  console.log(
    `Protected test route available at http://localhost:${port}/api/protected-test`
  );
});

export default server;
