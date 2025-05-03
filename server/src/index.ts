import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.get("/api/ping", (req: Request, res: Response) => {
  res.json({ message: "pong" });
});

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default server;
