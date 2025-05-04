import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import authRoutes from "./routes/auth";
import { AddressInfo } from "net";
import workspaceRoutes from "./routes/workspaces";
import { authenticateToken } from "./middleware/authMiddleware";
const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.get("/api/ping", (req: Request, res: Response) => {
  res.json({ message: "pong" });
});

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", authenticateToken, workspaceRoutes);

const server = http.createServer(app);
const addressInfo = server.address() as AddressInfo;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Auth routes available at http://localhost:${port}/api/auth`);
  console.log(
    `Workspace routes available at http://localhost:${port}/api/workspaces`
  );
});

export default server;
