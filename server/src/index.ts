import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import authRoutes from "./routes/auth";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.get("/api/ping", (req: Request, res: Response) => {
  res.json({ message: "pong" });
});

app.use("/api/auth", authRoutes);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(
    `Auth routes available at http://${server.address}:${port}/api/auth`
  );
});

export default server;
