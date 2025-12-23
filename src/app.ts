import express, { Request, Response } from "express";
import mongoose from "mongoose";

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ ok: true, message: "Server is running" });
});

const PORT = Number(process.env.PORT) || 3000;
const DB_URL = "mongodb://localhost:27017/mestodb";

async function start() {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connected to MongoDB");

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

start();