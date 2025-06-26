import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

import authRoutes from "./routes/auth.router";

dotenv.config();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = express();

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:5173"],
  method: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  res.sendFile(`${__dirname}/uploads/${filename}`);
});

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
